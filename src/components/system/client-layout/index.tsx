'use client';
import { ConfigProvider, RuntimeConfig } from '@/context/config-context';
import useUserStore from '@/store/useUserStore';
import { IUserProfile } from '@/types/user';
import { setConfigCache } from '@/utils/config';
import { refreshUserInfo } from '@/utils/user';
import React, { useEffect } from 'react';

interface IProps {
    children: React.ReactNode;
    profile: null | IUserProfile;
    runtimeConfig: RuntimeConfig;
}

const ClientLayout: React.FC<IProps> = ({ children, profile, runtimeConfig }) => {
    const setUserInfo = useUserStore(state => state.setUserInfo);
    const setLoadUserInfo = useUserStore(state => state.setLoadUserInfo);
    useEffect(() => {
        if (profile) {
            setUserInfo(profile);
            setLoadUserInfo(false);
        }
    }, [profile, setUserInfo, setLoadUserInfo]);

    useEffect(() => {
        // Cache runtime config for use in utilities
        setConfigCache(runtimeConfig);
    }, [runtimeConfig]);

    return (
        <ConfigProvider config={runtimeConfig}>
            <main>{children}</main>
        </ConfigProvider>
    );
};

export default ClientLayout;
