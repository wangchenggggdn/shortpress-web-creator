export const resolveStripeSandbox = (publicKey?: string, secretKey?: string) => {
    const combinedKeys = `${publicKey ?? ''} ${secretKey ?? ''}`.toLowerCase();

    if (combinedKeys.includes('pk_test_') || combinedKeys.includes('sk_test_') || combinedKeys.includes('_test_')) {
        return true;
    }

    if (combinedKeys.includes('pk_live_') || combinedKeys.includes('sk_live_') || combinedKeys.includes('_live_')) {
        return false;
    }

    return null;
};

export const getEnvironmentLabel = (isSandbox: boolean | null) => {
    if (isSandbox === null) {
        return 'Unknown';
    }

    return isSandbox ? 'Sandbox' : 'Live';
};
