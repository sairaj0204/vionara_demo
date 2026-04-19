import mongoose from 'mongoose';

const promoBannerSchema = new mongoose.Schema({
    messages: {
        type: [{
            text: { type: String, required: true },
            coupon: { type: String, default: '' }
        }],
        default: [{ text: '50% OFF on Select Styles', coupon: 'EXTRA100' }]
    },
    speed: { type: Number, default: 3000 },
    isActive: { type: Boolean, default: true },
    bgColor: { type: String, default: '#000000' },
    textColor: { type: String, default: '#ffffff' }
}, { timestamps: true });

export default mongoose.models.PromoBanner || mongoose.model('PromoBanner', promoBannerSchema);
