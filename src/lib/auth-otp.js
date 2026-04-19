import bcrypt from 'bcryptjs';
import AuthOtpChallenge from '@/models/AuthOtpChallenge';
import User from '@/models/User';
import {
    MAX_OTP_ATTEMPTS,
    OTP_RESEND_COOLDOWN_MS,
    OTP_RESEND_COOLDOWN_SECONDS,
    OTP_TTL_MS,
    OTP_TTL_SECONDS,
    generateAuthToken,
    generateOtp,
    hashOtp,
    isExpired,
    normalizeEmail,
    secondsUntil,
    serializeUser,
} from '@/lib/auth-utils';
import { sendVerificationCode } from '@/lib/messaging';

const SUPPORTED_PURPOSES = new Set(['login', 'signup', 'forgot-password']);

export class AuthOtpError extends Error {
    constructor(status, message, extra = {}) {
        super(message);
        this.status = status;
        this.extra = extra;
    }
}

function normalizePurpose(value) {
    const purpose = String(value || '').trim().toLowerCase();
    return SUPPORTED_PURPOSES.has(purpose) ? purpose : '';
}

function sanitizeName(value) {
    return String(value || '').trim();
}

function sanitizePassword(value) {
    return String(value || '');
}

async function getChallenge(email, purpose) {
    return AuthOtpChallenge.findOne({ email, purpose });
}

function buildOtpResponse({ email, purpose, message }) {
    return {
        success: true,
        purpose,
        identifier: email,
        channel: 'email',
        expiresIn: OTP_TTL_SECONDS,
        resendAvailableIn: OTP_RESEND_COOLDOWN_SECONDS,
        requiresVerification: true,
        message,
    };
}

async function deliverOtp({ challenge, otp }) {
    await sendVerificationCode({
        recipient: challenge.email,
        otp,
        name: challenge.name,
        purpose: challenge.purpose,
    });
}

async function prepareSignupChallenge({ challenge, email, name, password }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AuthOtpError(401, 'Account already exists. Please log in.');
    }

    if (!name) {
        throw new AuthOtpError(400, 'Full name is required.');
    }

    if (password.length < 6) {
        throw new AuthOtpError(400, 'Password must be at least 6 characters long.');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    if (challenge) {
        challenge.name = name;
        challenge.passwordHash = passwordHash;
        challenge.userId = null;
        return challenge;
    }

    return new AuthOtpChallenge({
        email,
        purpose: 'signup',
        name,
        passwordHash,
        channel: 'email',
    });
}

async function prepareLoginChallenge({ challenge, email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
        throw new AuthOtpError(401, 'Account not found. Please sign up.');
    }

    if (!user.isActive) {
        throw new AuthOtpError(401, 'Unauthorized.');
    }

    // Verify password before sending OTP
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new AuthOtpError(401, 'Invalid email or password.');
    }

    if (challenge) {
        challenge.name = user.name || '';
        challenge.passwordHash = null;
        challenge.userId = user._id;
        challenge.purpose = 'login';
        return challenge;
    }

    return new AuthOtpChallenge({
        email,
        purpose: 'login',
        name: user.name || '',
        userId: user._id,
        channel: 'email',
    });
}

async function prepareForgotPasswordChallenge({ challenge, email }) {
    const user = await User.findOne({ email });
    if (!user) {
        // Return generic success or error? User said "Show success or error response properly"
        // For forgot password, we should probably tell them if account doesn't exist for better UX, 
        // unlike standard practices which prefer obscurity to prevent enumeration.
        // Given the prompt "Show success or error response properly", I'll show error.
        throw new AuthOtpError(404, 'No account found with this email address.');
    }

    if (challenge) {
        challenge.name = user.name || '';
        challenge.userId = user._id;
        challenge.purpose = 'forgot-password';
        return challenge;
    }

    return new AuthOtpChallenge({
        email,
        purpose: 'forgot-password',
        name: user.name || '',
        userId: user._id,
        channel: 'email',
    });
}

function ensureOtpPayload({ purpose, email, otp }) {
    if (!purpose) {
        throw new AuthOtpError(400, 'Invalid authentication request.');
    }

    if (!email) {
        throw new AuthOtpError(400, 'Enter a valid email address.');
    }

    if (!/^\d{6}$/.test(otp)) {
        throw new AuthOtpError(400, 'Invalid OTP');
    }
}

export async function requestAuthOtp(payload = {}) {
    const purpose = normalizePurpose(payload.purpose);
    const email = normalizeEmail(payload.identifier || payload.email || '');
    const name = sanitizeName(payload.name);
    const password = sanitizePassword(payload.password);
    const resend = Boolean(payload.resend);

    if (!purpose) {
        throw new AuthOtpError(400, 'Invalid authentication request.');
    }

    if (!email) {
        throw new AuthOtpError(400, 'Enter a valid email address.');
    }

    let challenge = await getChallenge(email, purpose);

    if (resend) {
        if (!challenge) {
            throw new AuthOtpError(401, 'Unauthorized.');
        }
    } else if (purpose === 'signup') {
        challenge = await prepareSignupChallenge({ challenge, email, name, password });
    } else if (purpose === 'forgot-password') {
        challenge = await prepareForgotPasswordChallenge({ challenge, email });
    } else {
        challenge = await prepareLoginChallenge({ challenge, email, password });
    }

    const retryAfter = secondsUntil(challenge.resendAvailableAt);
    if (retryAfter > 0) {
        throw new AuthOtpError(401, `Please wait ${retryAfter}s before requesting another OTP.`, { retryAfter });
    }

    const otp = generateOtp();
    const now = Date.now();
    challenge.otpCodeHash = hashOtp(otp);
    challenge.otpExpiresAt = new Date(now + OTP_TTL_MS);
    challenge.resendAvailableAt = new Date(now + OTP_RESEND_COOLDOWN_MS);
    challenge.otpAttempts = 0;
    await challenge.save();

    await deliverOtp({ challenge, otp });
    console.log(`OTP sent to ${email} (${purpose})`); // Requirement 6

    return buildOtpResponse({
        email,
        purpose,
        message: resend ? 'OTP sent to your email address.' : 'OTP sent to your email address.',
    });
}

export async function resendAuthOtp(payload = {}) {
    return requestAuthOtp({ ...payload, resend: true });
}

export async function verifyAuthOtp(payload = {}) {
    const purpose = normalizePurpose(payload.purpose);
    const email = normalizeEmail(payload.identifier || payload.email || '');
    const otp = String(payload.otp || '').trim();

    ensureOtpPayload({ purpose, email, otp });

    const challenge = await getChallenge(email, purpose);
    if (!challenge) {
        throw new AuthOtpError(401, 'Unauthorized.');
    }

    if (challenge.otpAttempts >= MAX_OTP_ATTEMPTS) {
        throw new AuthOtpError(401, 'Unauthorized.');
    }

    if (isExpired(challenge.otpExpiresAt)) {
        throw new AuthOtpError(400, 'OTP expired');
    }

    if (hashOtp(otp) !== challenge.otpCodeHash) {
        challenge.otpAttempts += 1;
        await challenge.save();
        console.error(`OTP failed for ${email} (${purpose})`); // Requirement 6
        throw new AuthOtpError(400, 'Invalid OTP');
    }

    console.log(`OTP verified for ${email} (${purpose})`); // Requirement 6

    let user;

    if (purpose === 'signup') {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            await AuthOtpChallenge.deleteOne({ _id: challenge._id });
            throw new AuthOtpError(401, 'Account already exists. Please log in.');
        }

        user = await User.create({
            name: challenge.name,
            email: challenge.email,
            password: challenge.passwordHash, // This was hashed during requestAuthOtp
        });
    } else if (purpose === 'forgot-password') {
        user = await User.findById(challenge.userId);
        if (!user) {
            await AuthOtpChallenge.deleteOne({ _id: challenge._id });
            throw new AuthOtpError(404, 'User no longer exists.');
        }
        
        // Requirement 4: Don't login yet, return a reset token
        const resetToken = Math.random().toString(36).slice(-8) + Date.now().toString(36);
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await user.save();

        await AuthOtpChallenge.deleteOne({ _id: challenge._id });

        return {
            success: true,
            resetToken,
            message: 'OTP verified. You can now set a new password.',
        };
    } else {
        user = await User.findById(challenge.userId);
        if (!user || !user.isActive) {
            await AuthOtpChallenge.deleteOne({ _id: challenge._id });
            throw new AuthOtpError(401, 'Unauthorized.');
        }
    }

    await AuthOtpChallenge.deleteOne({ _id: challenge._id });

    return {
        success: true,
        token: generateAuthToken(user._id),
        user: serializeUser(user),
        message: purpose === 'login'
            ? 'OTP verified. You are now logged in.'
            : 'OTP verified. Your account has been created.',
    };
}
