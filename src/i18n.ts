import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import appConfig from './appConfig';

export default getRequestConfig(async ({ locale }) => {
    if (!appConfig.locales.includes(locale)) {
        notFound();
    }

    return {
        messages: (await import(`./lang/${locale}.json`)).default,
    };
});
