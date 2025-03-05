'use client';

import React, { useEffect } from 'react';
import { Card, Text, Button } from '@mantine/core';
import userStore from '@/store/useUserStore';
import Header from '@/components/system/header';
import { IUserStats } from '@/types/user';
import { useState } from 'react';
import CreatorApi from '@/api/creator';

/**
 * Home page component that displays user statistics and content management options
 * Shows a welcome message, stats cards, and a call-to-action for content creation
 * @returns React component with dashboard layout
 */
const HomePage = () => {
    const { userInfo } = userStore();
    const [stats, setStats] = useState<IUserStats | null>(null);

    useEffect(() => {
        CreatorApi.stats().then(res => {
            setStats(res.data);
        });
    }, []);

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="p-6 flex-1 flex flex-col">
                <h1 className="text-2xl text-black-purple font-bold mb-6">Hey {userInfo?.creatorName}, welcome back</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="text-center p-6" radius="lg">
                        <Text size="xl" fw={700} className="text-primary">
                            {stats?.videoCount ?? 0}
                        </Text>
                        <Text c="dimmed">videos</Text>
                    </Card>
                    <Card className="text-center p-6" radius="lg">
                        <Text size="xl" fw={700} className="text-primary">
                            {stats?.playlistCount ?? 0}
                        </Text>
                        <Text c="dimmed">playlists</Text>
                    </Card>
                    <Card className="text-center p-6" radius="lg">
                        <Text size="xl" fw={700} className="text-primary">
                            {stats?.siteCount ?? 0}
                        </Text>
                        <Text c="dimmed">websites</Text>
                    </Card>
                </div>

                {/* No Content State */}
                <Card className="flex-1 text-center py-12 flex flex-col items-center justify-center gap-4" radius="lg">
                    <Text size="lg" fw={500} className="mb-4">
                        No content available
                    </Text>
                    <Button
                        variant="filled"
                        color="primary"
                        onClick={() => {
                            window.location.href = '/videos';
                        }}
                    >
                        Upload Videos
                    </Button>
                </Card>
            </div>
        </div>
    );
};

export default HomePage;
