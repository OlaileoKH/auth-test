
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
// import toast from 'react-hot-toast';

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
      setLoading(true); // Start loading
        try {
            // Step 1: Sign up the user with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) {
                throw authError;
            }

            // Step 2: Insert the user's profile into the `profiles` table
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: authData.user?.id,
                        email,
                        username,
                    },
                ]);

            if (profileError) {
                throw profileError;
            }

            alert('Check your email for confirmation!');
            // toast.success('Check your email for confirmation!');
            // Redirect to the login page or protected page
            router.push('/login'); // Redirect to the login page after sign-up
        } catch (error) {
          const err = error as Error; // Cast the error to the Error type
          setError(err.message || 'An unknown error occurred during sign-up.');
      }finally {
        setLoading(false); // Stop loading
    }
    };

    return (
        <div className="flex flex-col text-black items-center justify-center min-h-screen bg-gray-100">
            <div className="p-6 bg-white rounded shadow-md">
                <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mb-4 p-2 border rounded w-full"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mb-4 p-2 border rounded w-full"
                />
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mb-4 p-2 border rounded w-full"
                />
                <button
    onClick={handleSignUp}
    disabled={loading} // Disable the button when loading
    className="w-full p-2 bg-blue-500 text-white rounded flex items-center justify-center"
>
    {loading ? (
        <>
            <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                ></circle>
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
            </svg>
            Signing Up...
        </>
    ) : (
        'Sign Up'
    )}
</button>
                <p className="mt-4 text-center">
                    Already have an account?{' '}
                    <a href="/login" className="text-blue-500">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
}