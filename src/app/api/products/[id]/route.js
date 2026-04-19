import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { getDemoProducts, normalizeProduct } from '@/lib/catalog';
import { verifyAdmin } from '@/lib/auth';
import { hasMongoConfig } from '@/lib/settings';
import Product from '@/models/Product';

export async function GET(_req, { params }) {
    const { id: rawId } = await params;
    const id = typeof rawId === 'string' ? rawId.trim() : '';

    if (!id) {
        return NextResponse.json({ success: false, message: 'Product id is required.' }, { status: 400 });
    }

    if (!hasMongoConfig()) {
        const product = getDemoProducts().find((item) => item._id === id);
        return product
            ? NextResponse.json({ success: true, product })
            : NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
    }

    try {
        await connectDB();
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid product id.' }, { status: 400 });
        }

        const product = await Product.findById(id).populate('category', 'name slug').lean();
        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, product: normalizeProduct(product) });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    const { id: rawId } = await params;
    const id = typeof rawId === 'string' ? rawId.trim() : '';

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ success: false, message: 'Invalid product id.' }, { status: 400 });
    }

    try {
        await connectDB();
        const adminUser = await verifyAdmin();
        if (!adminUser) {
            return NextResponse.json({ success: false, message: 'Not authorized as admin' }, { status: 403 });
        }

        const body = await req.json();

        // 4. Validate and Sanitize Input Data
        const updateData = {};
        if (body.stock !== undefined) {
            const stock = Number(body.stock);
            if (isNaN(stock)) return NextResponse.json({ success: false, message: 'Stock must be a valid number' }, { status: 400 });
            updateData.stock = stock;
        }
        if (body.price !== undefined) {
            const price = Number(body.price);
            if (isNaN(price)) return NextResponse.json({ success: false, message: 'Price must be a valid number' }, { status: 400 });
            updateData.price = price;
        }

        // Allow other standard product fields if present in body but prioritize inventory safety
        const allowedFields = ['name', 'description', 'category', 'mrp', 'discount', 'material', 'isActive'];
        allowedFields.forEach(field => {
            if (body[field] !== undefined) updateData[field] = body[field];
        });

        // 1 & 2. Modern Mongoose Update with Validation
        const product = await Product.findByIdAndUpdate(
            id, 
            { $set: updateData }, 
            { 
                returnDocument: "after", 
                runValidators: true 
            }
        ).populate('category', 'name slug').lean();

        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, product: normalizeProduct(product) });
    } catch (error) {
        // 3. Detailed Error Logging
        console.error("PRODUCT UPDATE ERROR:", {
            error: error.message || error,
            productId: id
        });
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(_req, { params }) {
    const { id: rawId } = await params;
    const id = typeof rawId === 'string' ? rawId.trim() : '';

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ success: false, message: 'Invalid product id.' }, { status: 400 });
    }

    try {
        await connectDB();
        const adminUser = await verifyAdmin();
        if (!adminUser) {
            return NextResponse.json({ success: false, message: 'Not authorized as admin' }, { status: 403 });
        }

        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Product deleted successfully.' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
