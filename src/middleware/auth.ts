import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import CookieMap from '@/config/cookie-map';

/**
 * List of paths that do not require authentication
 */
const publicPaths = ['/login', '/register', '/terms', '/privacy', '/forgot-password', '/not-found'];

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
    
    // Redirect authenticated users away from public pages
    if (isAuthenticated && isPublicPath) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Redirect unauthenticated users to login page
    if (!isAuthenticated && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
} 