import AccountLayout from '@/components/profile/AccountLayout';
import { HiOutlineCreditCard } from 'react-icons/hi';

const SavedPayments = () => (
    <AccountLayout>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: '#FEF2F2', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 20px',
            }}>
                <HiOutlineCreditCard size={34} style={{ color: '#DC2626' }} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 400, color: '#1a1a1a', margin: '0 0 8px' }}>
                Saved Payment Methods
            </h2>
            <p style={{ color: '#999', fontSize: 14 }}>No saved payment methods yet. Your cards will appear here after checkout.</p>
        </div>
    </AccountLayout>
);

export default SavedPayments;
