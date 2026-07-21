'use client';

import React from 'react';
import { AnalyticsResponse } from '@/api/respones';

interface CreationTableProps {
    records: AnalyticsResponse.CreationRecord[];
    isLoading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
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

const CreationTable: React.FC<CreationTableProps> = ({ records, isLoading, hasMore, onLoadMore }) => {
    return (
        <div className="flex flex-col h-[calc(100vh-200px)] overflow-hidden">
            <div className="overflow-auto flex-1">
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
                        </tr>
                    </thead>
                    <tbody>
                        {records.map(record => {
                            const preview =
                                record.videos?.[0]?.coverUrl ||
                                record.videos?.[0]?.url ||
                                record.images?.[0] ||
                                record.referenceImages?.[0] ||
                                '';
                            const mediaUrl = record.videos?.[0]?.url || record.images?.[0] || '';
                            return (
                                <tr key={record.taskId} className="border-b border-gray-100 text-sm text-gray-800 align-top">
                                    <td className="py-3 pr-4">
                                        {preview ? (
                                            <a
                                                href={mediaUrl || preview}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block w-20 h-12 overflow-hidden rounded bg-gray-100"
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={preview} alt="" className="w-full h-full object-cover" />
                                            </a>
                                        ) : (
                                            <div className="w-20 h-12 rounded bg-gray-100" />
                                        )}
                                    </td>
                                    <td className="py-3 pr-4 font-mono text-xs break-all max-w-[160px]">{record.taskId}</td>
                                    <td className="py-3 pr-4 font-mono text-xs break-all max-w-[140px]">{record.userId || '-'}</td>
                                    <td className="py-3 pr-4">{record.model || '-'}</td>
                                    <td className="py-3 pr-4">
                                        <span
                                            className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                                                record.status === 2
                                                    ? 'bg-green-50 text-green-700'
                                                    : record.status === 3
                                                      ? 'bg-red-50 text-red-700'
                                                      : 'bg-amber-50 text-amber-700'
                                            }`}
                                        >
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
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
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
        </div>
    );
};

export default CreationTable;
