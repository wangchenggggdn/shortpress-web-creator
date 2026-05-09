import { ConfigProvider, RuntimeConfig } from '@/context/config-context';

/**
 * Authentication layout component that provides a centered container for login/register forms
 * @param children Child components to be rendered (login/register forms)
 * @returns React component with centered authentication layout
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    // Build runtime configuration from environment variables
    const runtimeConfig: RuntimeConfig = {
        domain: process.env.NEXT_PUBLIC_DOMAIN || '',
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || '',
        imageDomain: process.env.IMAGE_DOMAIN || '',
        videoDomain: process.env.VIDEO_DOMAIN || '',
        nodeEnv: process.env.NEXT_PUBLIC_NODE_ENV || 'dev',
        previewDomain: process.env.NEXT_PUBLIC_DOMAIN_PREVIEW || '',
    };

    return (
        <ConfigProvider config={runtimeConfig}>
            <div className="min-h-screen flex flex-col items-center justify-center bg-layout">
                <div className="w-full max-w-md px-8">
                    {/* Logo */}
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold text-primary mb-2">ShortPress</h1>
                    </div>
                    {children}
                </div>
            </div>
        </ConfigProvider>
    );
}
