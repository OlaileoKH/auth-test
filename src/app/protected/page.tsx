
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import CommentSection from '@/app/components/CommentSection';

export default function ProtectedPage() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const handleCommentClick = () => {
        if (!user) {
            alert('Please log in to comment.'); // Show a login prompt
            router.push('/login'); // Redirect to the login page
        }
    };

    return (
        <div>
            <div className="mt-16 mb-10 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold">Protected Page</h1>
                {user ? (
                    <>
                        <p>Welcome, {user.email}!</p>
                        <button
                            onClick={signOut}
                            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
                        >
                            Sign Out
                        </button>
                    </>
                ) : (
                    <p>Welcome, guest! Please log in to comment.</p>
                )}
            </div>

            {/* Render the CommentSection */}
            <CommentSection user={user} onCommentClick={handleCommentClick} />
        </div>
    );
}