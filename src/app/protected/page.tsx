// app/protected/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import CommentSection from '@/app/components/CommentSection';
import { useEffect } from 'react';

export default function ProtectedPage() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    if (!user) return null;

    return (
        <div>
            <div className="mt-16 mb-10 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold">Protected Page</h1>
                <p>Welcome, {user.email}!</p>
                <button
                    onClick={signOut}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
                >
                    Sign Out
                </button>
            </div>

            {/* Render the CommentSection component */}
            <CommentSection user={user} />
        </div>
    );
}