import mongoose from 'mongoose';

const authOtpChallengeSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, lowercase: true, trim: true },
        purpose: { type: String, enum: ['login', 'signup', 'forgot-password'], required: true },
        name: { type: String, trim: true, default: '' },
        passwordHash: { type: String, default: null },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        otpCodeHash: { type: String, required: true },
        otpExpiresAt: { type: Date, required: true },
        otpAttempts: { type: Number, default: 0 },
        resendAvailableAt: { type: Date, required: true },
        channel: { type: String, default: 'email' },
    },
    { timestamps: true }
);

authOtpChallengeSchema.index({ email: 1, purpose: 1 }, { unique: true });

export default mongoose.models.AuthOtpChallenge || mongoose.model('AuthOtpChallenge', authOtpChallengeSchema);
