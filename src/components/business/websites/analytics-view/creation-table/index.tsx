'use client';

import React, { useMemo, useState } from 'react';
import { Modal } from '@mantine/core';
import { IconPlayerPlay } from '@tabler/icons-react';
import { AnalyticsResponse } from '@/api/respones';

export type CreationViewMode = 'list' | 'grid';

interface CreationTableProps {
    records: AnalyticsResponse.CreationRecord[];
    isLoading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    viewMode: CreationViewMode;
}

const STATUS_LABEL: Record<number, string> = {
    1: 'Processing',
    2: 'Success',
    3: 'Failed',
};

const formatTime = (unix: number) => {
    if (!unix) return '-';
    return new Date(unix * 1000).toLocaleString();
};

const formatCompletedTime = (record: AnalyticsResponse.CreationRecord) =>
    record.status === 2 || record.status === 3 ? formatTime(record.updatedAt) : '-';

type ResultMedia =
    | { kind: 'video'; url: string; coverUrl?: string }
    | { kind: 'image'; url: string };

const collectResultMedia = (record: AnalyticsResponse.CreationRecord): ResultMedia[] => {
    const items: ResultMedia[] = [];
    for (const video of record.videos || []) {
        if (video?.url) {
            items.push({ kind: 'video', url: video.url, coverUrl: video.coverUrl });
        }
    }
    for (const image of record.images || []) {
        if (image) {
            items.push({ kind: 'image', url: image });
        }
    }
    return items;
};

const previewOf = (record: AnalyticsResponse.CreationRecord) =>
    record.videos?.[0]?.coverUrl || record.videos?.[0]?.url || record.images?.[0] || record.referenceImages?.[0] || '';

const statusClass = (status: number) => {
    if (status === 2) return 'bg-green-50 text-green-700';
    if (status === 3) return 'bg-red-50 text-red-700';
    return 'bg-amber-50 text-amber-700';
};

const CreationTable: React.FC<CreationTableProps> = ({
    records,
    isLoading,
    hasMore,
    onLoadMore,
    viewMode,
}) => {
    const [selected, setSelected] = useState<AnalyticsResponse.CreationRecord | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const resultMedia = useMemo(() => (selected ? collectResultMedia(selected) : []), [selected]);
    const activeMedia = resultMedia[activeIndex] || resultMedia[0];

    const openRecord = (record: AnalyticsResponse.CreationRecord) => {
        setSelected(record);
        setActiveIndex(0);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] overflow-hidden">
            <div className="overflow-auto flex-1">
                {viewMode === 'list' ? (
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-white border-b border-gray-200">
                            <tr className="text-sm text-gray-500">
                                <th className="py-3 pr-4 font-medium">Preview</th>
                                <th className="py-3 pr-4 font-medium">Task ID</th>
                                <th className="py-3 pr-4 font-medium">User</th>
                                <th className="py-3 pr-4 font-medium">Model</th>
                                <th className="py-3 pr-4 font-medium">Status</th>
                                <th className="py-3 pr-4 font-medium">Prompt</th>
                                <th className="py-3 pr-4 font-medium">Created</th>
                                <th className="py-3 pr-4 font-medium">Completed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(record => {
                                const preview = previewOf(record);
                                return (
                                    <tr
                                        key={record.taskId}
                                        onClick={() => openRecord(record)}
                                        className="border-b border-gray-100 text-sm text-gray-800 align-top cursor-pointer hover:bg-gray-50"
                                    >
                                        <td className="py-3 pr-4">
                                            {preview ? (
                                                <div className="relative block w-20 h-12 overflow-hidden rounded bg-gray-100">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={preview} alt="" className="w-full h-full object-cover" />
                                                    {record.referenceImages?.[0] && (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={record.referenceImages[0]}
                                                            alt="Original image"
                                                            title="Original image"
                                                            className="absolute top-1 left-1 w-7 h-7 rounded object-cover border border-white shadow-sm"
                                                        />
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="relative w-20 h-12 rounded bg-gray-100">
                                                    {record.referenceImages?.[0] && (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={record.referenceImages[0]}
                                                            alt="Original image"
                                                            title="Original image"
                                                            className="absolute top-1 left-1 w-7 h-7 rounded object-cover border border-white shadow-sm"
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 pr-4 font-mono text-xs break-all max-w-[160px]">{record.taskId}</td>
                                        <td className="py-3 pr-4 font-mono text-xs break-all max-w-[140px]">{record.userId || '-'}</td>
                                        <td className="py-3 pr-4">{record.model || '-'}</td>
                                        <td className="py-3 pr-4">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${statusClass(record.status)}`}>
                                                {STATUS_LABEL[record.status] || String(record.status)}
                                            </span>
                                            {record.errorMsg ? (
                                                <div className="mt-1 text-xs text-red-500 max-w-[180px] break-words">{record.errorMsg}</div>
                                            ) : null}
                                        </td>
                                        <td className="py-3 pr-4 max-w-[280px]">
                                            <div className="line-clamp-3 text-gray-600">{record.prompt || '-'}</div>
                                        </td>
                                        <td className="py-3 pr-4 whitespace-nowrap">{formatTime(record.createdAt)}</td>
                                        <td className="py-3 pr-4 whitespace-nowrap">{formatCompletedTime(record)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2.5">
                        {records.map(record => {
                            const preview = previewOf(record);
                            const hasVideo = (record.videos?.length || 0) > 0;
                            return (
                                <button
                                    key={record.taskId}
                                    type="button"
                                    onClick={() => openRecord(record)}
                                    className="text-left rounded-lg overflow-hidden border border-gray-100 bg-white hover:shadow-md transition-shadow"
                                >
                                    <div className="relative aspect-square bg-gray-100">
                                        {preview ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={preview} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">No preview</div>
                                        )}
                                        {hasVideo && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <div className="w-7 h-7 rounded-full bg-black/55 text-white flex items-center justify-center">
                                                    <IconPlayerPlay size={12} fill="currentColor" />
                                                </div>
                                            </div>
                                        )}
                                        {record.referenceImages?.[0] && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={record.referenceImages[0]}
                                                alt="Original image"
                                                title="Original image"
                                                className="absolute top-1.5 left-1.5 w-10 h-10 rounded-md object-cover border-2 border-white shadow-md"
                                            />
                                        )}
                                        <span className={`absolute top-1 right-1 inline-flex px-1.5 py-0.5 rounded-full text-[10px] leading-none ${statusClass(record.status)}`}>
                                            {STATUS_LABEL[record.status] || String(record.status)}
                                        </span>
                                    </div>
                                    <div className="p-1.5 space-y-0.5">
                                        <div className="text-[11px] font-medium text-gray-900 truncate">{record.model || 'Unknown model'}</div>
                                        <div className="text-[10px] text-gray-500 line-clamp-1">{record.prompt || '-'}</div>
                                        <div className="text-[10px] text-gray-400 truncate">Created: {formatTime(record.createdAt)}</div>
                                        <div className="text-[10px] text-gray-400 truncate">Completed: {formatCompletedTime(record)}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {isLoading && <div className="py-8 text-center text-gray-500">Loading...</div>}
                {!isLoading && records.length === 0 && <div className="py-16 text-center text-gray-500">No Creations Yet</div>}
            </div>

            {hasMore && !isLoading && (
                <div className="pt-4 flex justify-center">
                    <button onClick={onLoadMore} className="px-4 py-2 text-sm rounded-full border border-primary text-primary hover:bg-primary/5">
                        Load More
                    </button>
                </div>
            )}

            <Modal
                opened={!!selected}
                onClose={() => setSelected(null)}
                title={null}
                withCloseButton
                size="xl"
                centered
                padding={0}
                styles={{
                    content: { borderRadius: '16px', overflow: 'hidden', background: '#0b0b0f' },
                    header: { background: 'transparent', position: 'absolute', right: 0, top: 0, zIndex: 2, padding: 12 },
                    body: { padding: 0 },
                    close: { color: '#fff', background: 'rgba(0,0,0,0.45)' },
                }}
            >
                {selected && (
                    <div className="flex flex-col">
                        <div className="relative bg-black min-h-[280px] max-h-[75vh] flex items-center justify-center">
                            {selected.status === 1 && !activeMedia ? (
                                <div className="text-white/70 py-24">Processing...</div>
                            ) : selected.status === 3 && !activeMedia ? (
                                <div className="text-red-300 py-24 px-6 text-center">{selected.errorMsg || 'Generation failed'}</div>
                            ) : activeMedia?.kind === 'video' ? (
                                <video
                                    key={activeMedia.url}
                                    src={activeMedia.url}
                                    controls
                                    autoPlay
                                    playsInline
                                    className="w-full max-h-[75vh] object-contain"
                                    poster={activeMedia.coverUrl || undefined}
                                />
                            ) : activeMedia?.kind === 'image' ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img key={activeMedia.url} src={activeMedia.url} alt="" className="w-full max-h-[75vh] object-contain" />
                            ) : (
                                <div className="text-white/50 py-24">No result yet</div>
                            )}
                        </div>

                        {resultMedia.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto px-4 py-3 bg-[#121218]">
                                {resultMedia.map((item, index) => {
                                    const thumb = item.kind === 'video' ? item.coverUrl || item.url : item.url;
                                    return (
                                        <button
                                            key={`${item.kind}-${item.url}-${index}`}
                                            type="button"
                                            onClick={() => setActiveIndex(index)}
                                            className={`shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${
                                                index === activeIndex ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={thumb} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CreationTable;
