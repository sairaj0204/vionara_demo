import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_TTL_SECONDS = OTP_TTL_MS / 1000;
export const OTP_RESEND_COOLDOWN_MS = 30 * 1000;
export const OTP_RESEND_COOLDOWN_SECONDS = OTP_RESEND_COOLDOWN_MS / 1000;
export const MAX_OTP_ATTEMPTS = 5;

export const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$/;

export function normalizeEmail(value = '') {
    const normalized = String(value).trim().toLowerCase();
    return EMAIL_REGEX.test(normalized) ? normalized : '';
}

export function resolveAuthIdentifier(payload = {}) {
    const identifierValue = String(payload.identifier || payload.email || '').trim();

    if (!identifierValue) {
        return null;
    }

    const normalizedEmail = normalizeEmail(identifierValue);
    if (normalizedEmail) {
        return {
            channel: 'email',
            identifier: normalizedEmail,
            email: normalizedEmail,
            label: 'email address',
        };
    }

    return null;
}

export function buildIdentifierQuery(identifier) {
    if (!identifier) {
        return null;
    }

    const normalizedEmail = normalizeEmail(identifier);
    if (normalizedEmail) {
        return { email: normalizedEmail };
    }

    return null;
}

export function generateOtp() {
    return crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, '0');
}

export function hashOtp(otp) {
    return crypto.createHash('sha256').update(String(otp)).digest('hex');
}

export function isExpired(date) {
    return !date || new Date(date).getTime() <= Date.now();
}

export function secondsUntil(date) {
    if (!date) {
        return 0;
    }

    return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 1000));
}

export function generateAuthToken(id) {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
}

export function serializeUser(user) {
    if (!user) {
        return null;
    }

    return {
        _id: user._id,
        name: user.name,
        email: user.email || '',
        role: user.role,
        avatar: user.avatar || '',
    };
}

export function isBcryptHash(value = '') {
    return BCRYPT_HASH_REGEX.test(String(value));
}

export function generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
}

export function hashResetToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}
