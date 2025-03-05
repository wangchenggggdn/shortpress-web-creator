'use client';
import React, { useEffect } from 'react';
import { IUserProfile } from '@/types/user';
import { refreshUserInfo } from '@/utils/user';
import useUserStore from '@/store/useUserStore';
import UploadProgressModal from '@/components/business/uploadProgressModal';

interface IProps {
    children: React.ReactNode;
    profile: null | IUserProfile;
}

const ClientLayout: React.FC<IProps> = ({ children, profile }) => {
    useEffect(() => {
        refreshUserInfo(profile, useUserStore.setState);
    }, [profile]);

    return <>{children}</>;
};

export default ClientLayout;
