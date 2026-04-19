import { useState, useEffect } from 'react';
import { useRouter } from 'next/compat/router';
import { HiOutlineTruck, HiOutlineSearch, HiCheck,
    HiOutlineDocumentText, HiOutlineCog, HiOutlineCube, HiOutlineBadgeCheck } from 'react-icons/hi';
import { trackOrder } from '@/services/api';
import toast from 'react-hot-toast';

const OrderTracking = ({ orderId = '' }) => {
    const router = useRouter();
    const [orderNumber, setOrderNumber] = useState('');
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (router && !router.isReady) {
            return;
        }

        const id = orderId || (typeof router?.query?.id === 'string' ? router.query.id : '');
        if (id) handleTrackById(id);
    }, [orderId, router]);

    const handleTrackById = async (id) => {
        setLoading(true);
        try {
            const { data } = await trackOrder(id);
            if (data.success) setTracking(data.tracking);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to track order');
        } finally { setLoading(false); }
    };

    const handleTrackSubmit = async (e) => {
        e.preventDefault();
        if (!orderNumber) return;
        setLoading(true);
        try {
            const { data } = await trackOrder(orderNumber);
            if (data.success) setTracking(data.tracking);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to find order.');
        } finally { setLoading(false); }
    };

    const steps = ['pending', 'paid', 'processing', 'shipped', 'delivered'];
    
    // Normalize mapping for legacy support
    const statusMap = { confirmed: "paid", packed: "processing" };
    const normalizedTrackingStatus = tracking ? (statusMap[tracking.status] || tracking.status) : '';
    
    const currentStepIndex = tracking ? steps.indexOf(normalizedTrackingStatus) : -1;
    const stepIcons = { pending: HiOutlineDocumentText, paid: HiOutlineDocumentText, processing: HiOutlineCog, shipped: HiOutlineTruck, delivered: HiOutlineBadgeCheck };

    return (
        <div style={{ minHeight: '100vh', background: '#F8F3EC', fontFamily: "'Inter', 'Segoe UI', sans-serif", color: '#2D2D2D' }}>

            {/* SEARCH HEADER */}
            <div style={{ background: '#FFF', borderBottom: '1px solid #EDE5D8', padding: '48px 16px' }}>
                <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                    <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, fontWeight: 500, color: '#1A1A1A', marginBottom: 6 }}>Track Your Order</h1>
                    <p style={{ fontSize: 12, color: '#999', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 36 }}>Enter your order number below</p>
                    <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: 0, border: '1px solid #D4C9B5', borderRadius: 10, overflow: 'hidden', background: '#FFF' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <HiOutlineSearch size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#BCAE96' }} />
                            <input type="text" placeholder="e.g. VNRM8X4A2B..." value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)}
                                style={{ width: '100%', padding: '14px 16px 14px 44px', border: 'none', outline: 'none', fontSize: 14, color: '#2D2D2D', background: 'transparent' }} />
                        </div>
                        <button type="submit" disabled={loading}
                            style={{ padding: '14px 32px', background: '#C9A34E', color: '#FFF', border: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
                            {loading ? '...' : 'TRACK'}
                        </button>
                    </form>
                </div>
            </div>

            <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 16px 64px' }}>

                {loading && !tracking && (
                    <div style={{ textAlign: 'center', padding: 48 }}>
                        <div style={{ width: 28, height: 28, border: '2px solid #C9A34E', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} />
                    </div>
                )}

                {tracking && !loading && (
                    <div>
                        {/* ORDER CARD */}
                        <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD0', marginBottom: 20 }}>

                            {/* HEADER */}
                            <div style={{ padding: '32px 32px 28px', borderBottom: '1px solid #F0EBE1' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                                    <div>
                                        <p style={{ fontSize: 10, fontWeight: 600, color: '#A09585', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6 }}>Order Details</p>
                                        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 500, color: '#1A1A1A', margin: 0 }}>
                                            #{tracking.orderNumber || tracking._id?.slice(-8).toUpperCase()}
                                        </h2>
                                        {tracking.createdAt && (
                                            <p style={{ fontSize: 13, color: '#999', marginTop: 6 }}>
                                                {new Date(tracking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        )}
                                    </div>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 16px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A34E', border: '1px solid #E5D7B7', background: '#FFFDF8' }}>
                                        {normalizedTrackingStatus}
                                    </span>
                                </div>
                            </div>

                            {/* PROGRESS STEPPER */}
                            <div style={{ padding: '36px 32px 32px' }}>
                                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
                                    {/* Background line */}
                                    <div style={{ position: 'absolute', top: 18, left: '10%', right: '10%', height: 1, background: '#E8DFD0' }} />
                                    {/* Active line */}
                                    {currentStepIndex > 0 && (
                                        <div style={{ position: 'absolute', top: 18, left: '10%', width: `${(currentStepIndex / (steps.length - 1)) * 80}%`, height: 1, background: '#C9A34E' }} />
                                    )}

                                    {steps.map((step, i) => {
                                        const done = i < currentStepIndex;
                                        const active = i === currentStepIndex;
                                        const pending = i > currentStepIndex;
                                        const Icon = stepIcons[step];

                                        const size = active ? 40 : 36;
                                        const borderColor = done || active ? '#C9A34E' : '#D4CCC0';
                                        const iconColor = done || active ? '#C9A34E' : '#C0B8AC';
                                        const bgColor = '#FFF';

                                        return (
                                            <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%', position: 'relative', zIndex: 1 }}>
                                                <div style={{
                                                    width: size, height: size, borderRadius: '50%', border: `1.5px solid ${borderColor}`,
                                                    background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {done ? <HiCheck size={16} color="#C9A34E" /> : <Icon size={active ? 18 : 16} color={iconColor} strokeWidth={1.2} />}
                                                </div>
                                                <p style={{
                                                    fontSize: 10, marginTop: 10, textTransform: 'uppercase', letterSpacing: '0.08em',
                                                    fontWeight: done || active ? 600 : 400,
                                                    color: done || active ? '#2D2D2D' : '#B0A898',
                                                    textAlign: 'center'
                                                }}>
                                                    {step}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* DELIVERY STRIP */}
                            <div style={{ padding: '20px 32px', background: '#FBF7F0', borderTop: '1px solid #F0EBE1', borderRadius: '0 0 12px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <HiOutlineTruck size={22} color="#C9A34E" strokeWidth={1.2} />
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 500, color: '#2D2D2D' }}>{tracking.courierName || 'Standard Secure Delivery'}</p>
                                        {(tracking.estimatedDelivery || tracking.expectedDeliveryDate) ? (
                                            <p style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                                                Estimated delivery: {new Date(tracking.expectedDeliveryDate || tracking.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </p>
                                        ) : (
                                            <p style={{ fontSize: 12, color: '#B0A898', marginTop: 2 }}>Delivery timeline available upon dispatch</p>
                                        )}
                                    </div>
                                </div>
                                {tracking.trackingUrl ? (
                                    <a href={tracking.trackingUrl} target="_blank" rel="noopener noreferrer"
                                        style={{ padding: '8px 20px', border: '1px solid #C9A34E', borderRadius: 6, color: '#C9A34E', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none' }}>
                                        Track Delivery
                                    </a>
                                ) : tracking.trackingNumber ? (
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: 10, color: '#B0A898', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Tracking ID</p>
                                        <p style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: '#2D2D2D' }}>{tracking.trackingNumber}</p>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {/* BOTTOM 2-COLUMN */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
                            {/* STATUS HISTORY */}
                            <div style={{ background: '#FFF', padding: 32, borderRadius: 12, border: '1px solid #E8DFD0' }}>
                                <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 500, marginBottom: 28, color: '#1A1A1A' }}>Status Timeline</h4>
                                <div style={{ position: 'relative', marginLeft: 8 }}>
                                    <div style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 1, background: '#E8DFD0' }} />
                                    {[...(tracking.statusHistory || [])].reverse().map((entry, i) => {
                                        const nStatus = statusMap[entry.status] || entry.status;
                                        return (
                                        <div key={i} style={{ position: 'relative', paddingLeft: 28, marginBottom: i < tracking.statusHistory.length - 1 ? 28 : 0 }}>
                                            <div style={{ position: 'absolute', left: -4, top: 5, width: 9, height: 9, borderRadius: '50%', background: '#FFF', border: '2px solid #C9A34E' }} />
                                            <p style={{ fontSize: 14, fontWeight: 500, color: '#2D2D2D', textTransform: 'capitalize', marginBottom: 3 }}>{nStatus}</p>
                                            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>{entry.note}</p>
                                            <p style={{ fontSize: 11, color: '#B0A898', marginTop: 4, letterSpacing: '0.04em' }}>
                                                {new Date(entry.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    )})}
                                </div>
                            </div>

                            {/* ORDER ITEMS */}
                            <div style={{ background: '#FFF', padding: 32, borderRadius: 12, border: '1px solid #E8DFD0' }}>
                                <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 500, marginBottom: 20, color: '#1A1A1A' }}>Items</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {tracking.items?.map((item, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 14, padding: 12, borderRadius: 10, border: '1px solid #F0EBE1' }}>
                                            <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', background: '#FAF6EF', flexShrink: 0 }}>
                                                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: 13, fontWeight: 500, color: '#2D2D2D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                                                <p style={{ fontSize: 11, color: '#B0A898', marginTop: 3 }}>Qty: {item.quantity || item.qty}</p>
                                            </div>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: '#2D2D2D', whiteSpace: 'nowrap' }}>₹{item.price?.toLocaleString('en-IN')}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Responsive + spinner keyframe */}
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (max-width: 768px) {
                    div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default OrderTracking;
