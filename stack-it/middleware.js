import { withAuth } from "next-auth/middleware";

// This middleware protects all routes under /dashboard
export default withAuth({
  pages: {
    signIn: "/sign-in",
  },
});

export const config = {
  matcher: [
    "/questions/:path*",
    "/ask/:path*",
    "/profile/:path*",
    "/notifications/:path*",
  ],
};
