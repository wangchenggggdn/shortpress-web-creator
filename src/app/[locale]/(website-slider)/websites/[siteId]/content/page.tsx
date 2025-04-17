'use client';

import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import { Button } from '@mantine/core';
import { IconPlus, IconCopy, IconSettings } from '@tabler/icons-react';
import AddContentModal from '@/components/business/websites/website-add-playlist-modal';
import WebsitePlaylist from '@/components/business/websites/website-playlist';
import CreateSiteModal from '@/components/business/websites/website-create-modal';
import { toast } from 'sonner';
import { Playlist } from '@/types/playlist';
import { IVideo } from '@/types/video';
import { Website } from '@/types/website';
import { WebsiteArgs } from '@/api/args';
import CreatorApi from '@/api/creator';
import WebsiteApi from '@/api/website';
import VideoApi from '@/api/video';
import PlaylistApi from '@/api/playlist';
import { SiteContext } from '@/components/business/websites/useContext/site-context';

interface WebsiteDetailPageProps {}

/**
 * Website detail page component
 * Manages website content, playlists, and preview functionality
 * @returns React component with website detail view
 */
const WebsiteDetailPage: React.FC<WebsiteDetailPageProps> = () => {
    const [website, setWebsite] = useState<Website>();
    const [videos, setVideos] = useState<IVideo[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [isAddContentOpen, setIsAddContentOpen] = React.useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [total, setTotal] = useState(0);
    const [createModalOpened, setCreateModalOpened] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [currentPlaylistsIndex, setCurrentPlaylistsIndex] = useState(0);
    const [videoPage, setVideoPage] = useState(1);
    const currentPlaylist = useRef<Playlist[]>([]);
    const { params } = useContext(SiteContext);
    console.log('params:', params);

    // Fetch website and playlist data when ID changes
    useEffect(() => {
        fetchWebsite();
        fetchPlaylists();
    }, [params.siteId]);

    useEffect(() => {
        if (playlists.length > 0) {
            currentPlaylist.current = playlists;
        }
    }, [playlists]);

    /**
     * Fetch website data from API
     */
    const fetchWebsite = async () => {
        WebsiteApi.get(params.siteId as string).then(res => {
            setWebsite({
                ...res.data,
                siteId: params.siteId as string,
            });
            console.log('website', res.data);
        });
    };

    /**
     * Fetch playlists for the website
     */
    const fetchPlaylists = async () => {
        // setLoadingData(true);
        const res = await PlaylistApi.list({
            page,
            pageSize,
            siteId: params.siteId as string,
            orderType: 1,
            status: 2,
        });
        if (res.code !== 0 || (res.data.items ?? []).length === 0) return null;
        const resD = await PlaylistApi.batchGet(res.data.items.join(','));
        if (resD.code !== 0 || (resD.data.items ?? []).length === 0) return null;
        resD.data.total = res.data.total;
        resD.data.page = res.data.page;
        resD.data.pageSize = res.data.pageSize;
        resD.data.hasMore = res.data.hasMore;
        setTotal(res.data.total);
        setPlaylists(resD.data.items);
        setCurrentPlaylistsIndex(0);
        fetchVideos(resD.data.items);
        // setLoadingData(false);
    };

    /**
     * Fetch videos from playlists
     * @param playlists Array of playlists to fetch videos from
     */
    const fetchVideos = async (playlists: Playlist[]) => {
        setVideoPage(1);
        let videosNew: IVideo[] = [];
        for (let i = 0; i < (playlists.length > 5 ? 5 : playlists.length); i++) {
            const res = await PlaylistApi.getVideos({
                status: -1,
                playlistId: playlists[i]?.playlistId ?? '',
                page: videoPage,
            });
            if (res.code !== 0 || (res.data.items ?? []).length === 0) continue;
            const resD = await VideoApi.batchGet(res.data.items.join(','));
            if (res.code !== 0 || (res.data.items ?? []).length === 0) continue;
            resD.data.total = res.data.total;
            resD.data.page = res.data.page;
            resD.data.pageSize = res.data.pageSize;
            resD.data.hasMore = res.data.hasMore;
            setVideoPage(res.data.page);
            videosNew = videosNew.concat(resD.data.items ?? []);
        }
        setVideos(videosNew);
    };

    /**
     * Search playlists based on query
     */
    const fetchPlaylistsBySearch = async () => {
        setLoadingData(true);
        const res = await PlaylistApi.search({
            page,
            pageSize,
            siteId: params.siteId as string,
            orderType: 1,
            status: 2,
            keyword: searchQuery,
        });
        setLoadingData(false);
        setPlaylists([]);
        if (res.code !== 0 || (res.data.items ?? []).length === 0) return null;
        setLoadingData(true);
        const resD = await PlaylistApi.batchGet(res.data.items.join(','));
        if (resD.code !== 0 || (resD.data.items ?? []).length === 0) return null;
        resD.data.total = res.data.total;
        resD.data.page = res.data.page;
        resD.data.pageSize = res.data.pageSize;
        resD.data.hasMore = res.data.hasMore;
        setTotal(res.data.total);
        setPlaylists(resD.data.items);
        setVideoPage(1);
        setVideos([]);
        fetchVideos(resD.data.items);
        setLoadingData(false);
    };

    // Fetch playlists when search query or page changes
    useEffect(() => {
        fetchPlaylistsBySearch();
    }, [searchQuery, page]);

    /**
     * Copy website URL to clipboard
     */
    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(`${website?.domain}/${website?.path}`);
        toast.success('Copy success');
    }, [website]);

    /**
     * Handle adding playlists to website
     * @param selectedItems Array of playlist IDs to add
     */
    const handleAddContent = (selectedItems: string[]) => {
        WebsiteApi.addPlaylists(params.siteId as string, selectedItems).then(res => {
            if (res.code === 0) {
                toast.success('Add content success');
                fetchPlaylists();
            } else {
                toast.error(res.info);
            }
        });
        setIsAddContentOpen(false);
    };

    /**
     * Handle page change
     * @param page New page number
     */
    const handlePageChange = (page: number) => {
        setPage(page);
    };

    /**
     * Handle loading more videos
     */
    const handleLoadMore = () => {
        console.log('load more');
        //fetchVideos(playlists[currentPlaylistsIndex]?.playlistId ?? '');
    };

    /**
     * Handle website settings submission
     * @param args Website modification data
     * @param coverFile Optional logo file
     */
    const handleSubmit = async (args: WebsiteArgs.Modify, coverFile?: File) => {
        setLoading(true);
        if (coverFile) {
            const formData = new FormData();
            formData.append('file', coverFile);
            const res = await CreatorApi.uploadFile(formData);
            if (res.code === 0) {
                args.logo = res.data ?? '';
            }
        }

        WebsiteApi.modify(args).then(res => {
            if (res.code === 0) {
                toast.success('save success');
                fetchWebsite();
                setCreateModalOpened(false);
            } else {
                toast.error(res.info);
            }
        });
        setLoading(false);
    };

    /**
     * Handle search input
     * @param value Search query
     * @param page Page number
     * @param pageSize Items per page
     */
    const handleSearch = (value: string, page: number, pageSize: number) => {
        setSearchQuery(value);
    };

    /**
     * Handle playlist deletion
     * @param playlistId ID of playlist to delete
     */
    const handleDelete = (playlistId: string) => {
        const index = playlists.findIndex(item => item.playlistId === playlistId);
        if (index !== -1) {
            const newPlaylists = playlists.filter(item => item.playlistId !== playlistId);
            setPlaylists(newPlaylists);
        }
        WebsiteApi.removePlaylists(params.siteId as string, [playlistId]);
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Top Navigation */}
            <div className="border-b w-full">
                <div className="h-16 px-6 flex items-center justify-between">
                    <h2 className="text-xl font-medium text-black-purple ">Websites</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
                            <div
                                className="text-primary cursor-pointer max-w-72 line-clamp-1"
                                onClick={() => {
                                    window.open(`${website?.domain}/${website?.path}`, '_blank');
                                }}
                            >{`${website?.domain}/${website?.path}`}</div>
                            <Button variant="subtle" size="sm" onClick={handleCopy} leftSection={<IconCopy size={16} />} className="border border-primary">
                                Copy
                            </Button>
                        </div>
                        <Button
                            onClick={() => setCreateModalOpened(true)}
                            variant="subtle"
                            color="primary"
                            leftSection={<IconSettings size={16} />}
                            className="border border-primary"
                        >
                            Settings
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex">
                {/* Left Content Area */}
                <div className="flex-1 px-6">
                    {/* Title Area */}

                    <div className="py-4 px-11 flex items-center justify-between">
                        <h2 className="text-lg font-medium text-black-purple">Contents</h2>
                        <Button leftSection={<IconPlus size={16} />} variant="filled" color="primary" onClick={() => setIsAddContentOpen(true)} className="border border-primary">
                            Add Content
                        </Button>
                    </div>

                    <WebsitePlaylist
                        isLoading={loadingData}
                        playlists={playlists}
                        total={total}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                        onSearch={handleSearch}
                        onDelete={handleDelete}
                        children={
                            playlists.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center">
                                    <h3 className="text-xl font-medium mb-4">No content added</h3>
                                    <Button
                                        leftSection={<IconPlus size={20} />}
                                        variant="filled"
                                        color="primary"
                                        size="lg"
                                        onClick={() => setIsAddContentOpen(true)}
                                        className="border border-primary"
                                    >
                                        Add content
                                    </Button>
                                </div>
                            )
                        }
                    />
                </div>

                {/* Right Preview Area */}
                {/* <div className="w-72 lg:w-80 h-full pr-6 pt-16">
                    <div className="w-full aspect-[9/16]">
                        <WebsitePreview playlist={videos} onLoadMore={handleLoadMore} />
                    </div>
                </div> */}
            </div>

            <AddContentModal isOpen={isAddContentOpen} onClose={() => setIsAddContentOpen(false)} onAdd={handleAddContent} siteId={params.siteId as string} />
            {/* Settings Modal */}
            {createModalOpened && (
                <>
                    <div className="fixed inset-0 bg-black/20 z-50" onClick={() => setCreateModalOpened(false)} />
                    <div className="fixed top-0 right-0 z-50 h-screen shadow-lg">
                        <div className="w-[480px] bg-white h-full flex flex-col">
                            <CreateSiteModal
                                opened={createModalOpened}
                                loading={loading}
                                websiteOld={website}
                                isEdit={true}
                                onClose={() => setCreateModalOpened(false)}
                                onSubmit={handleSubmit}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default WebsiteDetailPage;
