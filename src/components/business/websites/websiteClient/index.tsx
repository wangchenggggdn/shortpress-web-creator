'use client';

import React, { useEffect, useState } from 'react';
import { SiteContext } from '../useContext/monetize-context';
import WebsiteSidebar from '../slider';
import { getCookie } from '@/libs/fetch/fetchCookie/getCookie';
import cookieMap from '@/config/cookie-map';
import Cookies from 'js-cookie';

interface WebsiteClientProps {
    params: {
        siteId: string;
    };
    children: React.ReactNode;
}

const WebsiteClient: React.FC<WebsiteClientProps> = ({ params, children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const oldUseState = Cookies.get(cookieMap.UserState);
    if (oldUseState) {
        console.log('oldUseState:', oldUseState);
        const oldUseStateObj = JSON.parse(decodeURIComponent(oldUseState));
        oldUseStateObj.siteId = params.siteId;
        Cookies.set(cookieMap.UserState, encodeURIComponent(JSON.stringify(oldUseStateObj)));
    }

    return (
        <SiteContext.Provider value={{ params }}>
            <div className="flex min-h-screen bg-layout-page">
                {/* Sidebar - Hidden on mobile */}
                <div className="hidden md:block">
                    <WebsiteSidebar websiteId={params.siteId} collapsed={collapsed} onCollapse={setCollapsed} />
                </div>

                {/* Main Content - Adjusts margin based on sidebar state */}
                <div
                    className={`
                        flex-1 flex flex-col transition-all duration-300
                        md:ml-[240px]
                        ${collapsed ? 'md:ml-[60px]' : ''}
                    `}
                >
                    <div className="flex-1">{children}</div>
                </div>
            </div>
        </SiteContext.Provider>
    );
};

export default WebsiteClient;
