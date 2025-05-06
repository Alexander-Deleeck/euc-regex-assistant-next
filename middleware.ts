// middleware.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // Adjust path if auth.ts is elsewhere

export default auth((req) => {
  // req.auth contains session information if the user is authenticated

  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  console.log(`Middleware: Path=${pathname}, IsLoggedIn=${isLoggedIn}`); // Logging

  // If trying to access the login page while already logged in, redirect to home
  if (isLoggedIn && pathname === "/login") {
    console.log("Middleware: Redirecting logged-in user from /login to /");
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If trying to access a protected route (e.g., home page '/') without being logged in,
  // redirect to the login page.
  if (!isLoggedIn && pathname !== "/login") {
     console.log("Middleware: Redirecting unauthenticated user to /login");
    // Store the intended path to redirect back after login (optional)
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("callbackUrl", req.url); // Pass current URL
    return NextResponse.redirect(redirectUrl);
  }

  // Allow the request to proceed if none of the above conditions are met
  return NextResponse.next();
});

// Define which routes the middleware should run on
export const config = {
  // Matcher ignoring `/_next/`, `/api/` (including `/api/auth/`), and static files (`.png`, etc.)
   matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|logo/).*)"], // Exclude auth api routes, static files, and logo
};