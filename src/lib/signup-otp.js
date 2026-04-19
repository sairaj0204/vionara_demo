export { AuthOtpError as SignupOtpError } from '@/lib/auth-otp';
import { requestAuthOtp, resendAuthOtp, verifyAuthOtp } from '@/lib/auth-otp';

export async function requestSignupOtp(payload = {}) {
    return requestAuthOtp({ ...payload, purpose: 'signup' });
}

export async function verifySignupOtpCode(payload = {}) {
    return verifyAuthOtp({ ...payload, purpose: 'signup' });
}

export async function resendSignupOtpCode(payload = {}) {
    return resendAuthOtp({ ...payload, purpose: 'signup' });
}
