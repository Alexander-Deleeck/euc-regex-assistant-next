// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth"; // Adjust path if auth.ts is elsewhere
export const { GET, POST } = handlers;

// If you are using the Edge runtime, you need to uncomment this line
// export const runtime = "edge"