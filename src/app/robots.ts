import { MetadataRoute } from 'next';

const domain = process.env.NEXT_PUBLIC_DOMAIN||'';

const robots: () => MetadataRoute.Robots = () => {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
        },
        host: domain,
        sitemap: `${domain}/sitemap.xml`,
    };
};

export default robots;
