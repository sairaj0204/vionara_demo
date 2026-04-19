import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import SupportTicket from '@/models/SupportTicket';

export const runtime = 'nodejs';

// PATCH /api/admin/support-tickets/[id] — update status or add admin note
export async function PATCH(req, { params }) {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();
        const { status, adminNote } = body;

        const allowed = ['pending', 'in-progress', 'resolved', 'closed'];
        if (status && !allowed.includes(status)) {
            return NextResponse.json(
                { success: false, message: `Invalid status. Allowed: ${allowed.join(', ')}` },
                { status: 400 }
            );
        }

        const update = {};
        if (status)    update.status    = status;
        if (adminNote !== undefined) update.adminNote = adminNote;

        const ticket = await SupportTicket.findByIdAndUpdate(
            id,
            { $set: update },
            { new: true, runValidators: true }
        );

        if (!ticket) {
            return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, ticket });
    } catch (error) {
        console.error('[Admin/SupportTickets] PATCH error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// DELETE /api/admin/support-tickets/[id] — permanently remove a ticket
export async function DELETE(req, { params }) {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectDB();
        const { id } = await params;
        const ticket = await SupportTicket.findByIdAndDelete(id);
        if (!ticket) {
            return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Ticket deleted.' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
