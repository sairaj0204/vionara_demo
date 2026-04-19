import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import SupportTicket from '@/models/SupportTicket';

export const runtime = 'nodejs';

// GET /api/admin/support-tickets — list all tickets with filters
export async function GET(req) {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const status   = searchParams.get('status') || '';   // pending | in-progress | resolved | closed
        const category = searchParams.get('category') || ''; // exchange-request | payment-issue | …
        const page     = Math.max(1, Number(searchParams.get('page') || 1));
        const limit    = Math.min(100, Number(searchParams.get('limit') || 30));

        const filter = {};
        if (status)   filter.status   = status;
        if (category) filter.category = category;

        const [tickets, total] = await Promise.all([
            SupportTicket.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            SupportTicket.countDocuments(filter),
        ]);

        // Quick counts per status for the summary bar
        const counts = await SupportTicket.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        const summary = { pending: 0, 'in-progress': 0, resolved: 0, closed: 0, total };
        counts.forEach(({ _id, count }) => { if (_id in summary) summary[_id] = count; });

        return NextResponse.json({ success: true, tickets, summary, page, limit, total });
    } catch (error) {
        console.error('[Admin/SupportTickets] GET error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
