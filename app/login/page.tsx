// app/login/page.tsx
'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import LoginForm from "@/components/LoginForm";
import { handleCredentialsLogin } from "@/app/actions/auth.actions";
import { Toaster, toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


function LoginFunction() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const authError = searchParams.get('error'); // Get error from NextAuth redirect if it happens BEFORE login attempt

    useEffect(() => {
        if (authError === 'CredentialsSignin' && !error) {
            setError('Invalid username or password.');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null); // Clear previous errors before new attempt

        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('callbackUrl', callbackUrl);

        try {
            // Await the result from the server action
            const result = await handleCredentialsLogin(formData);

            // --- Check the RETURN VALUE for specific login errors ---
            if (result?.error) {
                console.log("Server action returned error:", result.error);
                setError(result.error);
                toast.error("Login Failed", { description: result.error });
            } else if (result?.success) {
                // Optional: Show success toast if needed, though redirect usually suffices
                // toast.success("Login Successful!");
                // Redirect should be handled by the signIn function within the action
                console.log("Server action returned success (redirect should follow).");
            }
            // If no error and no success explicitly returned, it might mean
            // the action threw NEXT_REDIRECT which was handled by Next.js

        } catch (err: any) {
            // Check if this is a NEXT_REDIRECT error
            if (err.message?.includes('NEXT_REDIRECT')) {
                // Don't show error toast for redirects - this is expected behavior
                console.log("Redirecting after successful login...");
                return; // Exit early, let Next.js handle the redirect
            }

            // Handle actual errors
            console.error("Unexpected error during login attempt:", err);
            const errorMessage = "An unexpected error occurred on the client. Please try again.";
            setError(errorMessage);
            toast.error("Login Failed", { description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LoginForm
            username={username}
            password={password}
            onUsernameChange={(e) => setUsername(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
            onSubmit={handleSubmit}
            isLoading={isLoading}
        />
    )
}

export default function LoginPage() {
    

    return (
        <Suspense fallback={<div className="flex justify-center items-center h-32">Loading...</div>}>
            <>
                {/* Display error state which might be set by initial load or submit handler */}
                {/* {error && !isLoading && ( // Avoid showing stale error during loading
                    <div className="flex justify-center pt-4 px-4">
                        <Alert variant="destructive" className="max-w-sm">
                            <AlertTitle>Login Failed</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </div>
                )} */}
                <LoginFunction />
                <Toaster richColors position="top-right" />
            </>
        </Suspense>
    );
}