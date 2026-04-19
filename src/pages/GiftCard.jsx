import AccountLayout from '@/components/profile/AccountLayout';
import { HiOutlineGift } from 'react-icons/hi';

const GiftCard = () => (
    <AccountLayout>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: '#FEF2F2', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 20px',
            }}>
                <HiOutlineGift size={34} style={{ color: '#DC2626' }} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 400, color: '#1a1a1a', margin: '0 0 8px' }}>
                Gift Card Balance
            </h2>
            <p style={{ color: '#999', fontSize: 14 }}>You don't have any active gift cards. Redeem a gift card at checkout.</p>
        </div>
    </AccountLayout>
);

export default GiftCard;
