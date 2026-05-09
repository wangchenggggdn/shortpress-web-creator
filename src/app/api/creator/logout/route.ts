import { NextResponse } from 'next/server';
import CookieMap from '@/config/cookie-map';

export async function POST() {
    const res = NextResponse.json({ code: 0, info: 'ok', data: true });

    const expired = new Date(0);
    const options = { expires: expired, path: '/' } as any;
    if (process.env.NEXT_PUBLIC_SETCOOKIES_DOMAIN) {
        options.domain = process.env.NEXT_PUBLIC_SETCOOKIES_DOMAIN;
    }

    console.log('options:', options);
    res.cookies.set(CookieMap.UserState, '', options);
    res.cookies.set(CookieMap.UserState0, '', options);
    res.cookies.set(CookieMap.UserState1, '', options);

    return res;
}


