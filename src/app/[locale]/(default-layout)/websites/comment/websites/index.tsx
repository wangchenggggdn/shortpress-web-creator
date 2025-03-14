'use client';
import React, { useState, useCallback } from 'react';
import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import Header from '@/components/system/header';
import CreateSiteModal from '@/components/business/websiteCreateModal';
import WebsiteCard from '@/components/business/websiteCard';
import WebsiteApi from '@/api/website';
import { Website } from '@/types/website';
import { toast } from 'sonner';
import { WebsiteArgs } from '@/api/args';
import { useRouter } from '@/libs/navigation';

interface IProps {
    websites: Website[];
}

/**
 * Websites management page component
 * Displays and manages user's websites with creation, editing, and deletion capabilities
 * @returns React component with website management interface
 */
const WebsitesView: React.FC<IProps> = ({ websites }) => {
    const route = useRouter();
    const [createModalOpened, setCreateModalOpened] = useState(false);
    /**
     * Handle website creation action
     */
    const handleCreateSite = useCallback(() => {
        setCreateModalOpened(true);
    }, []);

    /**
     * Handle website creation submission
     * @param siteData Website data to create
     */
    const handleSubmit = async (siteData: WebsiteArgs.Modify) => {
        const res = await WebsiteApi.create(siteData);
        if (res.code === 0) {
            toast.success('Create website successfully');
            setCreateModalOpened(false);
            route.push(`/websites/${res.data.siteId}`);
        } else {
            toast.error(res.info);
        }
    };

    /**
     * Handle website edit action
     * @param id Website ID to edit
     */
    const handleEdit = (id: string) => {
        console.log('Edit website:', id);
    };

    /**
     * Handle website deletion
     * @param id Website ID to delete
     */
    const handleDelete = (id: string) => {
        console.log('Delete website:', id);
    };

    return (
        <div className="flex flex-col h-screen">
            <Header className="flex items-center justify-between">
                <Button leftSection={<IconPlus size={16} />} variant="filled" color="primary" onClick={handleCreateSite}>
                    Create Site
                </Button>
            </Header>

            {/* Content Area */}
            <div className="flex-1 px-6 pb-6">
                <div className="bg-layout rounded-t-[32px] h-full p-6 flex flex-col">
                    {websites.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                            {websites.map(website => (
                                <WebsiteCard key={website.siteId} {...website} onEdit={handleEdit} onDelete={handleDelete} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <h2 className="text-xl font-medium mb-4">No website available</h2>
                            <Button leftSection={<IconPlus size={20} />} variant="filled" color="primary" size="lg" onClick={handleCreateSite}>
                                Create Site
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Website Modal */}
            {createModalOpened && (
                <>
                    <div className="fixed inset-0 bg-black/20 z-50" onClick={() => setCreateModalOpened(false)} />
                    <div className="fixed top-0 right-0 z-50">
                        <CreateSiteModal opened={createModalOpened} onClose={() => setCreateModalOpened(false)} onSubmit={handleSubmit} />
                    </div>
                </>
            )}
        </div>
    );
};

export default WebsitesView;
