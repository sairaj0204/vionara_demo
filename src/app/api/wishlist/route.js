import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req) {
    try {
        await connectDB();
        const userToken = await getUserFromToken();
        if (!userToken) return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });

        const user = await User.findById(userToken._id).populate('wishlist');
        return NextResponse.json({ success: true, wishlist: user.wishlist });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectDB();
        const userToken = await getUserFromToken();
        if (!userToken) return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });

        const { productId } = await req.json();
        const user = await User.findById(userToken._id);
        
        const index = user.wishlist.indexOf(productId);
        if (index > -1) {
            user.wishlist.splice(index, 1);
        } else {
            user.wishlist.push(productId);
        }
        
        await user.save();
        const updatedUser = await User.findById(userToken._id).populate('wishlist');
        
        return NextResponse.json({ success: true, wishlist: updatedUser.wishlist });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    return PUT(req);
}
