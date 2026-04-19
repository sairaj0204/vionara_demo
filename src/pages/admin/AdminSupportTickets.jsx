'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    HiOutlineRefresh,
    HiOutlineSearch,
    HiOutlineX,
    HiOutlineEye,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineExclamationCircle,
    HiOutlineFilter,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineClipboardList,
    HiOutlineChevronDown,
    HiOutlineTrash,
    HiOutlinePencil,
} from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS = {
    'order-tracking': 'Order Tracking',
    'cancel-order': 'Cancel Order',
    'exchange-request': 'Exchange Request',
    'payment-issue': 'Payment Issue',
    'product-query': 'Product Query',
    'other': 'Other',
};

const CATEGORY_COLORS = {
    'order-tracking': 'bg-blue-50 text-blue-700',
    'cancel-order': 'bg-red-50 text-red-700',
    'exchange-request': 'bg-amber-50 text-amber-700',
    'payment-issue': 'bg-purple-50 text-purple-700',
    'product-query': 'bg-emerald-50 text-emerald-700',
    'other': 'bg-gray-100 text-gray-600',
};

const STATUS_CONFIG = {
    pending:     { label: 'Pending',     color: 'bg-yellow-50 text-yellow-700 border border-yellow-200', dot: 'bg-yellow-400' },
    'in-progress':{ label: 'In Progress', color: 'bg-blue-50 text-blue-700 border border-blue-200',     dot: 'bg-blue-400' },
    resolved:    { label: 'Resolved',    color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-400' },
    closed:      { label: 'Closed',      color: 'bg-gray-100 text-gray-500 border border-gray-200',     dot: 'bg-gray-400' },
};

const NEXT_STATUS = {
    pending: 'in-progress',
    'in-progress': 'resolved',
    resolved: 'closed',
    closed: 'pending',
};

const NEXT_STATUS_LABEL = {
    pending: 'Mark In Progress',
    'in-progress': 'Mark Resolved',
    resolved: 'Mark Closed',
    closed: 'Reopen',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function CategoryBadge({ category }) {
    return (
        <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md ${CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-600'}`}>
            {CATEGORY_LABELS[category] || category}
        </span>
    );
}

// ─── Ticket Detail Modal ───────────────────────────────────────────────────────

function TicketModal({ ticket, onClose, onStatusChange, token }) {
    const [adminNote, setAdminNote] = useState(ticket.adminNote || '');
    const [saving, setSaving] = useState(false);

    const saveNote = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/support-tickets/${ticket._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ adminNote }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            toast.success('Note saved');
            onStatusChange(data.ticket);
        } catch (err) {
            toast.error(err.message || 'Failed to save note');
        } finally {
            setSaving(false);
        }
    };

    const advanceStatus = async () => {
        const next = NEXT_STATUS[ticket.status];
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/support-tickets/${ticket._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: next }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            toast.success(`Status → ${STATUS_CONFIG[next].label}`);
            onStatusChange(data.ticket);
        } catch (err) {
            toast.error(err.message || 'Failed to update status');
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-2xl mb-8 shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="font-mono text-xs font-bold text-gray-400 tracking-widest">{ticket.ticketNumber}</span>
                            <StatusBadge status={ticket.status} />
                            <CategoryBadge category={ticket.category} />
                        </div>
                        <h2 className="font-heading text-lg font-semibold text-charcoal">{ticket.subject}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-charcoal transition-colors ml-4 mt-1">
                        <HiOutlineX size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Contact Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                            <HiOutlineMail className="text-gold flex-shrink-0" size={16} />
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-gray-400">Email</p>
                                <p className="text-sm font-medium text-charcoal">{ticket.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                            <HiOutlinePhone className="text-gold flex-shrink-0" size={16} />
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-gray-400">Phone</p>
                                <p className="text-sm font-medium text-charcoal">{ticket.phone || '—'}</p>
                            </div>
                        </div>
                        {ticket.orderNumber && (
                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                                <HiOutlineClipboardList className="text-gold flex-shrink-0" size={16} />
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Order No.</p>
                                    <p className="text-sm font-mono font-semibold text-charcoal">{ticket.orderNumber}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                            <HiOutlineClock className="text-gold flex-shrink-0" size={16} />
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-gray-400">Submitted</p>
                                <p className="text-sm text-charcoal">{formatDate(ticket.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2 font-medium">Customer Message</p>
                        <div className="bg-[#FAFAFA] border border-gray-100 rounded-xl p-4">
                            <p className="text-sm text-gray-700 leading-7 whitespace-pre-wrap">{ticket.message}</p>
                        </div>
                    </div>

                    {/* Admin Note */}
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2 font-medium flex items-center gap-1.5">
                            <HiOutlinePencil size={12} /> Admin Note (internal)
                        </p>
                        <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            rows={3}
                            placeholder="Add an internal note about this ticket…"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gold bg-gray-50 focus:bg-white transition-all resize-none"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={saveNote}
                        disabled={saving}
                        className="text-sm font-medium border border-gray-200 bg-white hover:border-gold text-gray-600 hover:text-gold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Save Note
                    </button>
                    <button
                        onClick={advanceStatus}
                        disabled={saving}
                        className="flex items-center gap-2 text-sm font-semibold bg-charcoal hover:bg-gold text-white px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <HiOutlineCheckCircle size={16} />
                        {NEXT_STATUS_LABEL[ticket.status]}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Main AdminSupportTickets Component ───────────────────────────────────────

const AdminSupportTickets = () => {
    const { user } = useAuth();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

    const [tickets, setTickets] = useState([]);
    const [summary, setSummary] = useState({ pending: 0, 'in-progress': 0, resolved: 0, closed: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(''); // '' = all
    const [categoryFilter, setCategoryFilter] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: '100' });
            if (statusFilter)   params.set('status', statusFilter);
            if (categoryFilter) params.set('category', categoryFilter);

            const res = await fetch(`/api/admin/support-tickets?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            setTickets(data.tickets || []);
            setSummary(data.summary || {});
        } catch (err) {
            toast.error(err.message || 'Failed to load tickets');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, categoryFilter, token]);

    useEffect(() => { fetchTickets(); }, [fetchTickets]);

    // Client-side search on name/email/subject/ticketNumber
    const filtered = tickets.filter((t) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            t.email?.toLowerCase().includes(q) ||
            t.name?.toLowerCase().includes(q) ||
            t.subject?.toLowerCase().includes(q) ||
            t.ticketNumber?.toLowerCase().includes(q) ||
            t.orderNumber?.toLowerCase().includes(q)
        );
    });

    const handleStatusUpdate = (updated) => {
        setTickets((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
        setSelectedTicket(updated);
        // Refresh summary counts
        fetchTickets();
    };

    const handleQuickStatus = async (ticketId, newStatus, e) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/admin/support-tickets/${ticketId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            toast.success(`Marked as ${STATUS_CONFIG[newStatus].label}`);
            setTickets((prev) => prev.map((t) => (t._id === ticketId ? data.ticket : t)));
            fetchTickets();
        } catch (err) {
            toast.error(err.message || 'Update failed');
        }
    };

    const handleDelete = async (ticketId, e) => {
        e.stopPropagation();
        if (!window.confirm('Delete this ticket permanently?')) return;
        setDeletingId(ticketId);
        try {
            const res = await fetch(`/api/admin/support-tickets/${ticketId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            toast.success('Ticket deleted');
            setTickets((prev) => prev.filter((t) => t._id !== ticketId));
            fetchTickets();
        } catch (err) {
            toast.error(err.message || 'Delete failed');
        } finally {
            setDeletingId(null);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    const summaryItems = [
        { key: '',           label: 'All Tickets',  value: summary.total || 0,           icon: HiOutlineClipboardList, color: 'text-gray-600',   bg: 'bg-gray-50'   },
        { key: 'pending',    label: 'Pending',       value: summary.pending || 0,         icon: HiOutlineExclamationCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { key: 'in-progress',label: 'In Progress',   value: summary['in-progress'] || 0, icon: HiOutlineClock,         color: 'text-blue-600',   bg: 'bg-blue-50'   },
        { key: 'resolved',   label: 'Resolved',      value: summary.resolved || 0,        icon: HiOutlineCheckCircle,   color: 'text-emerald-600',bg: 'bg-emerald-50'},
    ];

    return (
        <AdminLayout
            title="Support Tickets"
            subtitle={`${summary.total || 0} total · ${summary.pending || 0} pending action`}
        >
            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {summaryItems.map(({ key, label, value, icon: Icon, color, bg }) => (
                    <button
                        key={key}
                        onClick={() => setStatusFilter(key)}
                        className={`relative text-left p-4 rounded-xl border transition-all duration-200 ${
                            statusFilter === key
                                ? 'border-gold bg-gold/5 shadow-sm'
                                : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                        }`}
                    >
                        <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                            <Icon className={color} size={18} />
                        </div>
                        <p className="text-xl font-bold text-charcoal">{value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                        {statusFilter === key && (
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gold" />
                        )}
                    </button>
                ))}
            </div>

            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input
                        type="text"
                        placeholder="Search tickets…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold bg-white"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-charcoal">
                            <HiOutlineX size={14} />
                        </button>
                    )}
                </div>

                {/* Category filter */}
                <div className="relative">
                    <HiOutlineFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="pl-8 pr-8 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold bg-white appearance-none cursor-pointer"
                    >
                        <option value="">All Categories</option>
                        {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                        ))}
                    </select>
                    <HiOutlineChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>

                {/* Refresh */}
                <button
                    onClick={fetchTickets}
                    disabled={loading}
                    className="p-2 border border-gray-200 rounded-lg hover:border-gold text-gray-500 hover:text-gold transition-colors"
                    title="Refresh"
                >
                    <HiOutlineRefresh className={loading ? 'animate-spin' : ''} size={16} />
                </button>

                {/* Active filters chips */}
                {(statusFilter || categoryFilter) && (
                    <button
                        onClick={() => { setStatusFilter(''); setCategoryFilter(''); }}
                        className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-2 rounded-lg transition-colors"
                    >
                        <HiOutlineX size={12} /> Clear filters
                    </button>
                )}

                <span className="ml-auto text-xs text-gray-400 hidden sm:block">
                    {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* ── Table ── */}
            {loading && tickets.length === 0 ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-14 text-center">
                    <HiOutlineClipboardList className="mx-auto text-gray-200 mb-4" size={48} />
                    <p className="text-gray-400 text-sm">No support tickets found.</p>
                    {(statusFilter || categoryFilter || search) && (
                        <button
                            onClick={() => { setStatusFilter(''); setCategoryFilter(''); setSearch(''); }}
                            className="mt-3 text-xs text-gold hover:underline"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    {/* Table header */}
                    <div className="hidden md:grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                        <span>User / Ticket</span>
                        <span>Category</span>
                        <span>Order No.</span>
                        <span>Subject</span>
                        <span>Status</span>
                        <span>Actions</span>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-gray-50">
                        {filtered.map((ticket, i) => (
                            <motion.div
                                key={ticket._id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                                onClick={() => setSelectedTicket(ticket)}
                                className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr_auto] gap-3 md:gap-4 px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer group items-center"
                            >
                                {/* User / Ticket */}
                                <div>
                                    <p className="text-sm font-medium text-charcoal truncate">{ticket.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{ticket.email}</p>
                                    <span className="font-mono text-[10px] text-gray-300 mt-0.5 block">{ticket.ticketNumber}</span>
                                    <p className="text-[10px] text-gray-300 md:hidden">{formatDate(ticket.createdAt)}</p>
                                </div>

                                {/* Category */}
                                <div className="flex items-center">
                                    <CategoryBadge category={ticket.category} />
                                </div>

                                {/* Order No. */}
                                <div>
                                    <span className="font-mono text-xs text-gray-500">{ticket.orderNumber || '—'}</span>
                                </div>

                                {/* Subject */}
                                <div>
                                    <p className="text-sm text-gray-700 truncate max-w-[240px]">{ticket.subject}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(ticket.createdAt)}</p>
                                </div>

                                {/* Status */}
                                <div>
                                    <StatusBadge status={ticket.status} />
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    {/* Quick resolve button */}
                                    {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                                        <button
                                            onClick={(e) => handleQuickStatus(ticket._id, 'resolved', e)}
                                            className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Mark Resolved"
                                        >
                                            <HiOutlineCheckCircle size={16} />
                                        </button>
                                    )}
                                    {/* View */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket); }}
                                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100"
                                        title="View Details"
                                    >
                                        <HiOutlineEye size={16} />
                                    </button>
                                    {/* Delete */}
                                    <button
                                        onClick={(e) => handleDelete(ticket._id, e)}
                                        disabled={deletingId === ticket._id}
                                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30"
                                        title="Delete Ticket"
                                    >
                                        <HiOutlineTrash size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Ticket Detail Modal ── */}
            <AnimatePresence>
                {selectedTicket && (
                    <TicketModal
                        key={selectedTicket._id}
                        ticket={selectedTicket}
                        token={token}
                        onClose={() => setSelectedTicket(null)}
                        onStatusChange={(updated) => {
                            handleStatusUpdate(updated);
                        }}
                    />
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

export default AdminSupportTickets;
