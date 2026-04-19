import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
    const { user, loading, isAdmin } = useAuth();

    const router = useRouter();
    const [mounted, setMounted] = require('react').useState(false);

    require('react').useEffect(() => {
        setMounted(true);
        if (!loading && (!user || !isAdmin)) {
            router.replace('/admin');
        }
    }, [user, loading, isAdmin, router]);

    if (!mounted || loading || (!user || !isAdmin)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Verifying access...</p>
                </div>
            </div>
        );
    }

    return children;
};

export default AdminProtectedRoute;
