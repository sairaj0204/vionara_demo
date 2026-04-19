import { Suspense } from 'react';
import AuthVerifyPage from '@/components/auth/AuthVerifyPage';

function VerifyPageFallback() {
    return (
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6">
            <div className="h-10 w-10 rounded-full border-2 border-[#C9A34E]/30 border-t-[#C9A34E] animate-spin" />
        </div>
    );
}

export default function AuthVerifyRoute() {
    return (
        <Suspense fallback={<VerifyPageFallback />}>
            <AuthVerifyPage />
        </Suspense>
    );
}
