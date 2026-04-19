'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Captured by Global Error Boundary:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9F6F1] px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl border border-gray-100 text-center shadow-sm">
                <HiOutlineExclamationCircle size={56} className="mx-auto text-red-400 mb-4" />
                <h2 className="font-heading text-2xl text-charcoal mb-2">Something went wrong</h2>
                <p className="text-sm text-gray-500 mb-8">
                    An unexpected error occurred. Our team has been notified.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => reset()}
                        className="btn-gold w-full text-sm py-3"
                    >
                        Try again
                    </button>
                    <Link href="/" className="btn-outline-gold w-full text-sm py-3 line-clamp-1 block leading-loose">
                        Return to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
