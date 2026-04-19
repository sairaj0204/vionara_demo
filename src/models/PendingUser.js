import mongoose from 'mongoose';

const pendingUserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        otpCodeHash: { type: String, required: true },
        otpExpiresAt: { type: Date, required: true },
        otpAttempts: { type: Number, default: 0 },
        resendAvailableAt: { type: Date, required: true },
        channel: { type: String, default: 'email' },
    },
    { timestamps: true }
);

pendingUserSchema.index({ otpExpiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.PendingUser || mongoose.model('PendingUser', pendingUserSchema);
