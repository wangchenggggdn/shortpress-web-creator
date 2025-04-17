import { createContext } from 'react';

interface SiteContextType {
    params: {
        siteId: string;
    };
}

export const SiteContext = createContext<SiteContextType>({
    params: {
        siteId: '',
    },
});
