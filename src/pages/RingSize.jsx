import AccountLayout from '@/components/profile/AccountLayout';
import { MdOutlineRingVolume } from 'react-icons/md';

const RingSize = () => (
    <AccountLayout>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: '#FEF2F2', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 20px',
            }}>
                <MdOutlineRingVolume size={34} style={{ color: '#DC2626' }} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 400, color: '#1a1a1a', margin: '0 0 8px' }}>
                Ring Size Preference
            </h2>
            <p style={{ color: '#999', fontSize: 14 }}>Save your Ring size for a seamless shopping experience. Coming soon.</p>
        </div>
    </AccountLayout>
);

export default RingSize;
