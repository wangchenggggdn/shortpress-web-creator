This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Internationalization (i18n) Setup Guide

To add support for a new language, you need to modify the following files:

1. **src/appConfig.ts**

```typescript
const appConfig: IConfig = {
    // ...
    locales: ['en', 'zh'], // Add new language code here
    defaultLocale: 'en', // Set default language
    // ...
};
```

2. **src/middleware.ts**

```typescript
export const config = {
    matcher: [
        '/((?!api|auth|_next|_vercel|.*\\..*).*)',
        `/(en|zh)/:path*`, // Add new language to path matching
    ],
};
```

3. **src/lang/[locale].json**

-   Create a translation file for the new language, e.g., `fr.json`:

```json
{
    "Welcome to Shortify": "Welcome to Shortify"
}
```

4. **Type Declaration (Optional)**

```typescript
// Ensure type safety
type Messages = typeof import('../lang/en.json');
declare interface IntlMessages extends Messages {}
```

### Important Notes:

-   Ensure all language files have the same key structure
-   Middleware matcher configuration requires hardcoded language codes (build-time configuration)
-   Use `useTranslations` hook to get translated text
-   Language switching should be handled through `useRouter`

### Usage Example:

```typescript
'use client';
import { useTranslations } from 'next-intl';

export default function Component() {
    const t = useTranslations();
    return <h1>{t('Welcome to Shortify')}</h1>;
}
```
