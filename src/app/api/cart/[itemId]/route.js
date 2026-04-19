import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Cart from '@/models/Cart';
import { getUserFromToken } from '@/lib/auth';

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const user = await getUserFromToken();
        if (!user) return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });

        const { itemId } = await params;
        const cart = await Cart.findOne({ user: user._id });
        if (!cart) return NextResponse.json({ success: false, message: 'Cart not found' }, { status: 404 });

        cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
        await cart.save();

        const updatedCart = await Cart.findOne({ user: user._id }).populate('items.product');
        return NextResponse.json({ success: true, cart: updatedCart });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const user = await getUserFromToken();
        if (!user) return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });

        const { quantity } = await req.json();
        const { itemId } = await params;

        const cart = await Cart.findOne({ user: user._id });
        if (!cart) return NextResponse.json({ success: false, message: 'Cart not found' }, { status: 404 });

        const item = cart.items.id(itemId);
        if (!item) return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });

        item.quantity = quantity;
        await cart.save();

        const updatedCart = await Cart.findOne({ user: user._id }).populate('items.product');
        return NextResponse.json({ success: true, cart: updatedCart });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
