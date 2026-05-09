const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: false, // 禁用生产环境的 source maps
    reactStrictMode: false,
    output: 'standalone',
    compress: true,
    compiler: {
        removeConsole: {
            exclude: process.env.NEXT_PUBLIC_NODE_ENV === 'dev' || process.env.NEXT_PUBLIC_NODE_ENV === 'local_dev' ? ['log', 'warn', 'error'] : ['warn', 'error'],
        },
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    experimental: {
        optimizePackageImports: ['@mantine/core', '@mantine/hooks', '@mantine/carousel'],
    },
    images: {
        domains: ['picsum.photos'],
    },
};

module.exports = withNextIntl(nextConfig);
