import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const readLocalCart = () => {
    if (typeof window === 'undefined') return { items: [] };
    try {
        const stored = localStorage.getItem('vionara_cart');
        return stored ? JSON.parse(stored) : { items: [] };
    } catch {
        return { items: [] };
    }
};

const writeLocalCart = (cartData) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('vionara_cart', JSON.stringify(cartData));
    }
};

export const CartProvider = ({ children }) => {
    // Initialize from localStorage so cart persists across page loads
    const [cart, setCart] = useState({ items: [] });
    const [isCartOpen, setIsCartOpen] = useState(false);
    // hydrated becomes true once localStorage has been read on the client.
    // Gate any redirects on this flag to avoid premature empty-cart redirects.
    const [hydrated, setHydrated] = useState(false);

    // Hydrate from localStorage after mount (avoids SSR mismatch)
    useEffect(() => {
        setCart(readLocalCart());
        setHydrated(true);
    }, []);

    // Single source of truth: always update both state AND localStorage together
    const persistCart = useCallback((updater) => {
        setCart(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            writeLocalCart(next);
            return next;
        });
    }, []);

    const addItem = useCallback((product, quantity = 1, size = '') => {
        persistCart(prev => {
            const existingIndex = prev.items.findIndex(
                item => item.product._id === product._id && item.size === size
            );
            
            let newItems;
            if (existingIndex >= 0) {
                newItems = prev.items.map((item, index) => 
                    index === existingIndex 
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                newItems = [...prev.items, { product, quantity, size, _id: Date.now().toString() }];
            }
            
            return { ...prev, items: newItems };
        });
    }, [persistCart]);

    const removeItem = useCallback((itemId) => {
        persistCart(prev => ({
            ...prev,
            items: prev.items.filter(item => item._id !== itemId),
        }));
    }, [persistCart]);

    const updateQuantity = useCallback((itemId, quantity) => {
        persistCart(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item._id === itemId
                    ? { ...item, quantity: Math.max(1, quantity) }
                    : item
            ),
        }));
    }, [persistCart]);

    const clearCartItems = useCallback(() => {
        persistCart({ items: [] });
    }, [persistCart]);

    const getCartTotal = useCallback(() =>
        cart.items.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0)
    , [cart]);

    const getCartCount = useCallback(() =>
        cart.items.reduce((sum, item) => sum + item.quantity, 0)
    , [cart]);

    const refreshCart = useCallback(() => {
        setCart(readLocalCart());
    }, []);

    return (
        <CartContext.Provider value={{
            cart,
            hydrated,
            addItem,
            removeItem,
            updateQuantity,
            clearCartItems,
            getCartTotal,
            getCartCount,
            isCartOpen,
            setIsCartOpen,
            refreshCart,
        }}>
            {children}
        </CartContext.Provider>
    );
};
