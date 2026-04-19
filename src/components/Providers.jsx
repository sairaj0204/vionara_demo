'use client';

import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ThemeProvider } from '@/context/ThemeContext';
import LoginModal from '@/components/ui/LoginModal';
import { useAuth } from '@/context/AuthContext';

const InnerProviders = ({ children }) => {
    const { showLoginModal, setShowLoginModal } = useAuth();
    return (
        <>
            <Toaster position="top-center" toastOptions={{
                style: { background: '#1A1A1A', color: '#fff', fontFamily: 'Inter, sans-serif' },
                duration: 3000,
            }} />
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
            {children}
        </>
    );
};

const Providers = ({ children }) => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <CartProvider>
                    <WishlistProvider>
                        <InnerProviders>
                            {children}
                        </InnerProviders>
                    </WishlistProvider>
                </CartProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default Providers;
