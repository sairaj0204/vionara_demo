import { createContext, useContext, useState, useEffect } from 'react';
import {
    adminLoginApi,
    getProfile,
    sendOtpApi,
    verifyOtpApi,
    forgotPasswordApi,
    resetPasswordApi,
} from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const token = localStorage.getItem('vionara_token');

        if (token) {
            getProfile()
                .then(({ data }) => {
                    if (isMounted && data && data.user) {
                        setUser(data.user);
                    }
                })
                .catch((error) => {
                    // Only remove token if unauthorized (401), not on network errors
                    if (error?.response?.status === 401) {
                        localStorage.removeItem('vionara_token');
                    }
                })
                .finally(() => {
                    if (isMounted) {
                        setLoading(false);
                    }
                });
        } else {
            Promise.resolve().then(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });
        }

        return () => {
            isMounted = false;
        };
    }, []);

    const login = async (email, password) => {
        const { data } = await sendOtpApi({ purpose: 'login', email, password });
        if (data && data.success === false) {
            throw new Error(data.message || 'Login failed');
        }
        return data;
    };

    const adminLogin = async (email, password) => {
        const { data } = await adminLoginApi({ email, password });
        if (data.token) {
            localStorage.setItem('vionara_token', data.token);
        }
        if (data.user) {
            setUser(data.user);
        }
        return data;
    };

    const requestSignupOtp = async ({ name, email, password }) => {
        const { data } = await sendOtpApi({ purpose: 'signup', name, email, password });
        if (data && data.success === false) {
            throw new Error(data.message || 'Signup failed');
        }
        return data;
    };

    const verifyOtp = async ({ purpose, email, otp }) => {
        const { data } = await verifyOtpApi({ purpose, identifier: email, otp });
        if (data && data.success === false) {
            // Throw generic error if success is explicitly false (to trip the catch block)
            throw new Error(data.message || 'Invalid OTP');
        }
        if (data && data.token) {
            localStorage.setItem('vionara_token', data.token);
            setUser(data.user);
        }
        return data;
    };

    const verifySignupOtp = async (email, otp) => {
        return verifyOtp({ purpose: 'signup', email, otp });
    };

    const resendOtp = async ({ purpose, email }) => {
        const { data } = await sendOtpApi({ purpose, identifier: email, resend: true });
        if (data && data.success === false) {
            const error = new Error(data.message || 'Failed to resend OTP');
            // Attach retryAfter to the error object so the UI can read it
            if (data.retryAfter) error.retryAfter = data.retryAfter;
            throw error;
        }
        return data;
    };

    const resendSignupOtp = async (email) => {
        return resendOtp({ purpose: 'signup', email });
    };

    const register = async (name, email, password) => {
        return requestSignupOtp({ name, email, password });
    };

    const forgotPassword = async (email) => {
        const { data } = await forgotPasswordApi({ email });
        if (data && data.success === false) {
            throw new Error(data.message || 'Forgot password request failed');
        }
        return data;
    };

    const resetPassword = async (email, token, password) => {
        const { data } = await resetPasswordApi({ email, token, password });
        if (data && data.success === false) {
            throw new Error(data.message || 'Password reset failed');
        }
        return data;
    };

    const logout = () => {
        localStorage.removeItem('vionara_token');
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    const refreshUser = async () => {
        try {
            const { data } = await getProfile();
            if (data && data.success) {
                setUser(data.user);
            }
        } catch (error) {
            console.error("Failed to refresh user:", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                adminLogin,
                register,
                logout,
                updateUser,
                isAdmin: user?.role === 'admin',
                showLoginModal,
                setShowLoginModal,
                requestSignupOtp,
                verifyOtp,
                verifySignupOtp,
                resendOtp,
                resendSignupOtp,
                forgotPassword,
                resetPassword,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
