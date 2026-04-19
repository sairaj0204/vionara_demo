import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Cart from '@/models/Cart';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req) {
    try {
        await connectDB();
        const user = await getUserFromToken();
        if (!user) return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });

        let cart = await Cart.findOne({ user: user._id }).populate('items.product');
        if (!cart) cart = { items: [] };

        return NextResponse.json({ success: true, cart });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const user = await getUserFromToken();
        if (!user) return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });

        const { productId, quantity = 1, size = '' } = await req.json();
        let cart = await Cart.findOne({ user: user._id });

        if (!cart) {
            cart = new Cart({ user: user._id, items: [] });
        }

        const existingItem = cart.items.find(
            (item) => item.product.toString() === productId && item.size === size
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity, size });
        }

        await cart.save();
        cart = await Cart.findOne({ user: user._id }).populate('items.product');
        
        return NextResponse.json({ success: true, cart });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await connectDB();
        const user = await getUserFromToken();
        if (!user) return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });

        await Cart.findOneAndUpdate({ user: user._id }, { items: [] });

        return NextResponse.json({ success: true, message: 'Cart cleared' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
