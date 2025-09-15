import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import CookieMap from '@/config/cookie-map';

/**
 * List of paths that do not require authentication
 */
const publicPaths = ['/login', '/register', '/terms', '/privancy', '/forgot-password', '/not-found'];

/**
 * Authentication middleware for Next.js
 * Handles route protection and authentication redirects
 * @param request The incoming request
 * @returns NextResponse with appropriate redirects or continuation
 */
export function authMiddleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const isPublicPath = publicPaths.some(path => pathname.endsWith(path));
    const isAuthenticated = request.cookies.has(CookieMap.UserState);
    const isAuthenticated0 = request.cookies.has(CookieMap.UserState0);
    const isAuthenticated1 = request.cookies.has(CookieMap.UserState1);

    console.log('pathname:', pathname);
    // Redirect authenticated users away from public pages
    if ((isAuthenticated || isAuthenticated0 || isAuthenticated1) && isPublicPath) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Redirect unauthenticated users to login page
    if (!(isAuthenticated || isAuthenticated0 || isAuthenticated1) && !isPublicPath) {
        request.cookies.set(CookieMap.UserState, '');
        request.cookies.set(CookieMap.UserState0, '');
        request.cookies.set(CookieMap.UserState1, '');
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
} 