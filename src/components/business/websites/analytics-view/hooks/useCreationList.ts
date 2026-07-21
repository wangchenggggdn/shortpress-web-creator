'use client';

import { useCallback, useEffect, useState } from 'react';
import AnalyticsApi from '@/api/analytics';
import { AnalyticsResponse } from '@/api/respones';

interface UseCreationListProps {
    siteId: string;
}

interface UseCreationListReturn {
    records: AnalyticsResponse.CreationRecord[];
    isLoading: boolean;
    total: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    refresh: () => void;
}

export const useCreationList = ({ siteId }: UseCreationListProps): UseCreationListReturn => {
    const [records, setRecords] = useState<AnalyticsResponse.CreationRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 20;

    const fetchData = useCallback(
        async (currentPage = 1, replace = true) => {
            if (!siteId) return;
            setIsLoading(true);
            try {
                const response = await AnalyticsApi.getCreations({
                    siteId,
                    page: currentPage,
                    pageSize,
                });
                if (response.code === 0 && response.data) {
                    const items = response.data.items || [];
                    setRecords(prev => (replace || currentPage <= 1 ? items : [...prev, ...items]));
                    setTotal(response.data.total || 0);
                    setPage(currentPage);
                } else if (replace) {
                    setRecords([]);
                    setTotal(0);
                }
            } catch {
                if (replace) {
                    setRecords([]);
                    setTotal(0);
                }
            } finally {
                setIsLoading(false);
            }
        },
        [siteId, pageSize],
    );

    useEffect(() => {
        fetchData(1, true);
    }, [fetchData]);

    return {
        records,
        isLoading,
        total,
        page,
        pageSize,
        onPageChange: nextPage => {
            fetchData(nextPage, false);
        },
        refresh: () => fetchData(1, true),
    };
};
