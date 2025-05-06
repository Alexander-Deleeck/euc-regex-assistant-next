// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { User } from "next-auth"; // Import User type

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // The name to display on the sign in form (optional)
      name: "Credentials",
      // `credentials` is used to generate a form on the sign-in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req): Promise<User | null> {
        // Add logic here to look up the user from the credentials supplied
        // This is where you check against your environment variables
        console.log("Authorize attempt with:", credentials?.username); // Log attempt

        const appUser = process.env.APP_USERNAME;
        const appPassword = process.env.APP_PASSWORD;

        if (!appUser || !appPassword) {
          console.error("Auth environment variables not set!");
          return null; // Fail if env vars are missing
        }

        if (
          credentials?.username === appUser &&
          credentials?.password === appPassword
        ) {
          // Any object returned will be saved in `user` property of the JWT
          // Return a basic user object. ID and name are common. Avoid sensitive info.
          const user: User = {
             id: "admin-user-id", // A static ID for your single admin user
             name: credentials.username,
             // email: "admin@example.com" // optional
           };
          console.log("Authorization successful for:", user.name);
          return user;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          console.log("Authorization failed for:", credentials?.username);
          return null;
          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
          // throw new Error("Invalid credentials")
        }
      },
    }),
  ],
  // Optional: Specify custom pages if you want names other than /login, /error etc.
  pages: {
    signIn: "/login", // Redirect users to /login if they are not authenticated
    // error: '/auth/error', // Error code passed in query string as ?error=
  },
  // Optional: Add callbacks for session/jwt customization if needed later
  // callbacks: {
  //   async jwt({ token, user }) {
  //     // Persist the user id from provider to the token right after signin
  //     if (user) {
  //       token.id = user.id;
  //     }
  //     return token;
  //   },
  //   async session({ session, token }) {
  //     // Send properties to the client, like an access_token and user id from the token.
  //     if (session.user && token.id) {
  //        session.user.id = token.id as string;
  //     }
  //     return session;
  //   },
  // },
});