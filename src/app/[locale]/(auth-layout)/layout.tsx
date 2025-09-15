/**
 * Authentication layout component that provides a centered container for login/register forms
 * @param children Child components to be rendered (login/register forms)
 * @returns React component with centered authentication layout
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-layout">
            <div className="w-full max-w-md px-8">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-primary mb-2">ShortPress</h1>
                </div>
                {children}
            </div>
        </div>
    );
}
