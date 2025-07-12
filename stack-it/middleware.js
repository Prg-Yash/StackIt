import { withAuth } from "next-auth/middleware";

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
