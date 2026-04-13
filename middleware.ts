export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/members/:path*',
    '/api/members/:path*',
    '/api/match/:path*',
    '/api/outreach/:path*',
  ],
};
