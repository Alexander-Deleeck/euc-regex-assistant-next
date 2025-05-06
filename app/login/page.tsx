// app/login/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import LoginForm from "@/components/LoginForm";
import { handleCredentialsLogin } from "@/app/actions/auth.actions";
import { Toaster, toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
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
            // This catch block now primarily handles UNEXPECTED errors
            // (e.g., network failure, server action crashing BEFORE returning)
            // It should NOT catch the NEXT_REDIRECT error if the action re-throws it correctly.
            console.error("Unexpected error during login attempt:", err);
            const errorMessage = "An unexpected error occurred on the client. Please try again.";
            setError(errorMessage);
            toast.error("Login ", { description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
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
            <LoginForm
                username={username}
                password={password}
                onUsernameChange={(e) => setUsername(e.target.value)}
                onPasswordChange={(e) => setPassword(e.target.value)}
                onSubmit={handleSubmit}
                isLoading={isLoading}
            // Don't pass the error prop directly to LoginForm if it displays its own based on state
            // error={error || undefined} // This might cause double display
            />
            {/* Ensure Toaster is rendered */}
            <Toaster richColors position="top-right" />
        </>
    );
}