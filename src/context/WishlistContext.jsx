import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getWishlist as fetchApiWishlist, toggleWishlist as toggleApiWishlist } from '../services/api';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();

    const getLocalWishlist = () => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('vionara_wishlist');
            return stored ? JSON.parse(stored) : [];
        }
        return [];
    };

    const [wishlist, setWishlist] = useState(getLocalWishlist());

    useEffect(() => {
        if (user) {
            fetchApiWishlist().then(({ data }) => {
                if (data.success) setWishlist(data.wishlist);
            }).catch(console.error);
        } else {
            setWishlist(getLocalWishlist());
        }
    }, [user]);

    const toggleItem = useCallback(async (product) => {
        if (user) {
            try {
                const { data } = await toggleApiWishlist(product._id);
                if (data.success) setWishlist(data.wishlist);
            } catch (error) {
                console.error("Failed to toggle wishlist", error);
            }
        } else {
            const current = getLocalWishlist();
            const exists = current.find((item) => item._id === product._id);
            let updated;
            if (exists) {
                updated = current.filter((item) => item._id !== product._id);
            } else {
                updated = [...current, product];
            }
            localStorage.setItem('vionara_wishlist', JSON.stringify(updated));
            setWishlist(updated);
        }
    }, [user]);

    const isInWishlist = useCallback((productId) => {
        return wishlist.some((item) => item._id === productId);
    }, [wishlist]);

    const removeFromWishlist = useCallback(async (productId) => {
        if (user) {
            try {
                const { data } = await toggleApiWishlist(productId);
                if (data.success) setWishlist(data.wishlist);
            } catch (error) {
                console.error("Failed to remove from wishlist", error);
            }
        } else {
            const current = getLocalWishlist();
            const updated = current.filter((item) => item._id !== productId);
            localStorage.setItem('vionara_wishlist', JSON.stringify(updated));
            setWishlist(updated);
        }
    }, [user]);

    return (
        <WishlistContext.Provider value={{ wishlist, toggleItem, isInWishlist, removeFromWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
