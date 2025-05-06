// app/actions/auth.actions.ts
'use server';

import { signIn, signOut } from "@/lib/auth"; // Adjust path if necessary
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

// Action to handle credentials login
export async function handleCredentialsLogin(formData: FormData) {
  try {
    const callbackUrl = formData.get('callbackUrl') as string || '/';
    console.log("Attempting sign in with credentials...");

    // Call signIn with credentials and redirect target
    await signIn('credentials', {
       ...Object.fromEntries(formData),
       redirectTo: callbackUrl,
     });

    // If signIn is successful and redirects, this part might not be reached.
    console.log("Sign in action completed (redirect likely occurred).");
    // Returning success might be useful if redirect: false was used, but not needed here.
    return { success: true };

  } catch (error: any) { // Catch any error
    // *** IMPORTANT: Check for and re-throw the specific redirect error ***
    if (error.message?.includes('NEXT_REDIRECT')) {
      console.log("Caught NEXT_REDIRECT signal, re-throwing to allow redirect.");
      throw error; // Re-throw the error so Next.js can handle the redirect
    }

    // --- Handle actual authentication and other errors below ---

    console.error("Sign in error caught (not NEXT_REDIRECT):", error);

    if (error instanceof AuthError) {
      switch (error.name) { // Check the error name
        case 'CredentialsSignin':
           console.error("Invalid credentials provided.");
          return { error: 'Invalid username or password.' };
        // Add other specific AuthError cases if needed
        default:
           console.error("Unhandled AuthError name:", error.name, "Cause:", error.cause);
          return { error: 'An unexpected authentication error occurred.' };
      }
    }

    // Handle non-AuthErrors
    console.error("Non-AuthError during sign in:", error);
    return { error: 'An unexpected server error occurred. Please try again.' };
  }
}

// Action to handle logout
export async function handleLogout() {
  try {
     console.log("Attempting sign out...");
    await signOut({ redirectTo: '/login', redirect: true }); // Ensure redirect is true
     console.log("Sign out initiated (redirect should be happening).");
  } catch (error: any) { // Catch any error including potential redirect errors
     // Check for and re-throw the redirect signal if needed for signOut
     if (error.message?.includes('NEXT_REDIRECT')) {
       console.log("Caught NEXT_REDIRECT during signout, re-throwing.");
       throw error; // Re-throw to allow Next.js redirect
     }
    // Handle other unexpected errors during signout
    console.error("Sign out error:", error);
    // Fallback redirect might be needed if signOut itself fails unexpectedly
    redirect('/?error=SignOutFailed');
  }
}