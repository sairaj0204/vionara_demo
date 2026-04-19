import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('vionara_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const sendOtpApi = (data) => API.post('/auth/send-otp', data);
export const verifyOtpApi = (data) => API.post('/auth/verify-otp', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const adminLoginApi = (data) => API.post('/admin/login', data);
export const requestSignupOtpApi = (data) => sendOtpApi({ ...data, purpose: 'signup' });
export const verifySignupOtpApi = (data) => verifyOtpApi({ ...data, purpose: 'signup' });
export const resendSignupOtpApi = (data) => sendOtpApi({ ...data, purpose: 'signup', resend: true });
export const forgotPasswordApi = (data) => API.post('/auth/forgot-password', data);
export const resetPasswordApi = (data) => API.post('/auth/reset-password', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const addAddress = (data) => API.post('/auth/addresses', data);
export const deleteAddress = (id) => API.delete(`/auth/addresses/${id}`);
export const updateAddressApi = (id, data) => API.put(`/auth/addresses/${id}`, data);
export const setAddressDefaultApi = (id) => API.put(`/auth/addresses/${id}/default`);
export const changePasswordApi = (data) => API.put('/auth/profile/password', data);
export const getAllUsers = () => API.get('/auth/users');
export const getAllUsersAdmin = () => API.get('/auth/users');

// Products
export const getProducts = (params) => API.get('/products', { params });
export const getSearchSuggestions = (query) => API.get('/products/search/suggestions', { params: { query } });
export const getProductBySlug = (slug) => API.get(`/products/slug/${slug}`);
export const getProductById = (id) => API.get(`/products/${id}`);
export const getRelatedProducts = (id) => API.get(`/products/${id}/related`);
export const createProduct = (data) => API.post('/products', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const getAllProductsAdmin = () => API.get('/products/admin/all');
export const bulkUploadProducts = (data) => API.post('/products/bulk-upload', data);
export const searchByImageApi = async (data) => {
    const formData = new FormData();
    const { image } = data;

    if (image.startsWith('blob:')) {
        const blob = await fetch(image).then(r => r.blob());
        formData.append('image', blob, 'search.jpg');
    } else if (image.startsWith('data:')) {
        const mimeType = image.split(';')[0].split(':')[1];
        const byteString = atob(image.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        const blob = new Blob([ab], { type: mimeType });
        formData.append('image', blob, 'search.jpg');
    } else {
        return API.post('/products/search-by-image', { image });
    }

    console.log('[searchByImageApi] Sending FormData with image file...');
    return API.post('/products/search-by-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// Categories
export const getCategories = () => API.get('/categories');
export const getCategoryBySlug = (slug) => API.get(`/categories/slug/${slug}`);
export const createCategory = (data) => API.post('/categories', data);
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

// Cart
export const getCart = () => API.get('/cart');
export const addToCart = (data) => API.post('/cart', data);
export const updateCartItem = (itemId, data) => API.put(`/cart/${itemId}`, data);
export const removeCartItem = (itemId) => API.delete(`/cart/${itemId}`);
export const clearCart = () => API.delete('/cart');

// Wishlist
export const getWishlist = () => API.get('/wishlist');
export const toggleWishlist = (productId) => API.post('/wishlist', { productId });

// Orders
export const createOrder = (data) => API.post('/orders', data);
export const getUserOrders = () => API.get('/orders/my-orders');
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const trackOrder = (orderNumber) => API.get(`/orders/track/${orderNumber}`);
export const getAllOrders = () => API.get('/orders/all');
export const updateOrderStatus = (id, data) => API.put(`/orders/${id}/status`, data);

// Coupons
export const validateCoupon = (data) => API.post('/coupons/validate', data);
export const getCoupons = () => API.get('/coupons');
export const createCoupon = (data) => API.post('/coupons', data);
export const updateCoupon = (id, data) => API.put(`/coupons/${id}`, data);
export const deleteCoupon = (id) => API.delete(`/coupons/${id}`);

// Payment (Razorpay)
export const createPaymentOrder = (data) => API.post('/payment/create-order', data);
export const verifyPayment = (data) => API.post('/payment/verify', data);

// Shipping (Shiprocket)
export const checkPincode = (data) => API.post('/shipping/check-pincode', data);
export const calculateShipping = (data) => API.post('/shipping/calculate', data);
export const createShipment = (data) => API.post('/shipping/create-shipment', data);
export const trackShipment = (orderId) => API.get(`/shipping/track/${orderId}`);
export const cancelShipment = (orderId) => API.post(`/shipping/cancel/${orderId}`);

// Reviews
export const addReview = (productId, data) => API.post(`/reviews/${productId}`, data);

// Admin Dashboard
export const getDashboardStats = () => API.get('/admin/stats');
export const getAnalytics = (params) => API.get('/admin/analytics', { params });
export const getInventoryReport = () => API.get('/admin/inventory');
export const updateStockBulk = (data) => API.post('/admin/inventory/bulk-update', data);
export const getAdminSettings = () => API.get('/admin/settings');
export const updateAdminSettings = (data) => API.put('/admin/settings', data);

// Dynamic CMS Settings
export const getSettings = (keys) => API.get('/settings', { params: { keys } });
export const updateSettings = (data) => API.post('/settings', data);
export const getHeroSetting = () => API.get('/settings/hero');
export const updateHeroSlides = (heroSlides) => API.put('/settings/hero', { heroSlides });
export const getThemeApi = () => API.get('/settings/theme');
export const updateThemeApi = (data) => API.post('/settings/theme', data);

// Upload
export const uploadImages = (formData) => API.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Promo Banner
export const getPromoBanner = () => API.get('/promo-banner');
export const updatePromoBanner = (data) => API.put('/promo-banner', data);

export default API;
