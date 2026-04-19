import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { hasMongoConfig } from '@/lib/settings';
import PromoBanner from '@/models/PromoBanner';

const DEFAULT_PROMO_BANNER = {
    messages: [{ text: '50% OFF on Select Styles', coupon: 'EXTRA100' }],
    speed: 3000,
    isActive: true,
    bgColor: '#000000',
    textColor: '#ffffff',
};

const normalizeBanner = (banner = {}) => {
    const messages = Array.isArray(banner.messages) && banner.messages.length
        ? banner.messages
            .map((message) => ({
                text: typeof message === 'string' ? message : message?.text || '',
                coupon: typeof message === 'string' ? '' : message?.coupon || '',
            }))
            .filter((message) => message.text.trim() !== '')
        : DEFAULT_PROMO_BANNER.messages;

    return {
        ...DEFAULT_PROMO_BANNER,
        ...banner,
        messages,
    };
};

export async function GET() {
    if (!hasMongoConfig()) {
        return NextResponse.json({
            success: true,
            banner: DEFAULT_PROMO_BANNER,
            fallback: true,
            message: 'Using default promo banner because MONGODB_URI is not configured.',
        });
    }

    try {
        await connectDB();

        const storedBanner = await PromoBanner.findOne().sort({ updatedAt: -1 }).lean();

        return NextResponse.json({
            success: true,
            banner: normalizeBanner(storedBanner || DEFAULT_PROMO_BANNER),
        });
    } catch (error) {
        return NextResponse.json({
            success: true,
            banner: DEFAULT_PROMO_BANNER,
            fallback: true,
            message: error.message,
        });
    }
}

export async function PUT(req) {
    if (!hasMongoConfig()) {
        return NextResponse.json(
            { success: false, message: 'MONGODB_URI is required to save the promo banner.' },
            { status: 503 }
        );
    }

    try {
        await connectDB();

        const payload = normalizeBanner(await req.json());
        const existingBanner = await PromoBanner.findOne().sort({ updatedAt: -1 });

        const banner = existingBanner
            ? await PromoBanner.findByIdAndUpdate(existingBanner._id, payload, { new: true })
            : await PromoBanner.create(payload);

        return NextResponse.json({
            success: true,
            banner,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
