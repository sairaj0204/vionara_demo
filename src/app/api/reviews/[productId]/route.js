import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { hasMongoConfig } from '@/lib/settings';
import { getUserFromToken } from '@/lib/auth';
import Product from '@/models/Product';

export async function POST(req, { params }) {
    const { productId: rawProductId } = await params;
    const productId = typeof rawProductId === 'string' ? rawProductId.trim() : '';

    if (!productId) {
        return NextResponse.json(
            { success: false, message: 'Product id is required.' },
            { status: 400 }
        );
    }

    if (!hasMongoConfig()) {
        return NextResponse.json(
            { success: false, message: 'Reviews require a configured database.' },
            { status: 503 }
        );
    }

    try {
        await connectDB();

        const user = await getUserFromToken();
        if (!user) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json({ success: false, message: 'Invalid product id.' }, { status: 400 });
        }

        const { rating, comment, images = [] } = await req.json();
        if (!rating || !comment?.trim()) {
            return NextResponse.json(
                { success: false, message: 'Rating and comment are required.' },
                { status: 400 }
            );
        }

        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
        }

        const existingReview = product.reviews.find(
            (review) => review.user?.toString() === user._id.toString()
        );

        if (existingReview) {
            existingReview.rating = rating;
            existingReview.comment = comment.trim();
            existingReview.images = images;
        } else {
            product.reviews.push({
                user: user._id,
                rating,
                comment: comment.trim(),
                images,
            });
        }

        product.numReviews = product.reviews.length;
        product.averageRating = product.reviews.length
            ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
            : 0;

        await product.save();

        return NextResponse.json({ success: true, product });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
