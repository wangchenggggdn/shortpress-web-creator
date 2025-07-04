import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import appConfig from './appConfig';
import { authMiddleware } from './middleware/auth';


const intlMiddleware = createMiddleware({
    locales: appConfig.locales,
    defaultLocale: appConfig.defaultLocale,
    localePrefix: 'as-needed',
    localeDetection: false,
});


export default async function middleware(request: NextRequest) {
    const authResponse = authMiddleware(request);
    if (authResponse.status !== 200) {
        return authResponse;
    }
    return intlMiddleware(request);
}


export const config = {
    matcher: ['/((?!api|auth|_next|_vercel|.*\\..*).*)', `/(en|zh)/:path*`],
};
