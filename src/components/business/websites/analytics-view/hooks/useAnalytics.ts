import { useState, useCallback } from 'react';
import AnalyticsApi from '@/api/analytics';
import { AnalyticsResponse } from '@/api/respones';
import { toast } from 'sonner';
import { IPaginationResponse } from '@/types/public';

export type TimeRange = 'day' | '3days' | 'week' | 'month';

interface UseAnalyticsProps {
    siteId: string;
}

interface UseAnalyticsReturn {
    incomeData: AnalyticsResponse.DailyIncome[] | null;
    transactions: AnalyticsResponse.IncomeTransaction[];
    totalAmount: number;
    totalCount: number;
    isLoading: boolean;
    isTransactionsLoading: boolean;
    timeRange: TimeRange;
    setTimeRange: (range: TimeRange) => void;
    fetchData: () => Promise<void>;
    fetchTransactions: () => Promise<void>;
}

const getTimeRangeInSeconds = (range: TimeRange): number => {
    switch (range) {
        case 'day':
            return 24 * 60 * 60;
        case '3days':
            return 3 * 24 * 60 * 60;
        case 'week':
            return 7 * 24 * 60 * 60;
        case 'month':
            return 30 * 24 * 60 * 60;
        default:
            return 30 * 24 * 60 * 60;
    }
};

const formatDateByRange = (date: Date, range: TimeRange): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    switch (range) {
        case 'day':
            return `${month}/${day}`;
        case '3days':
            const group = Math.floor((day - 1) / 3) * 3 + 1;
            return `${month}/${group}-${group + 2}`;
        case 'week':
            const week = Math.ceil(day / 7);
            return `${month}/W${week}`;
        case 'month':
            return `${month}月`;
        default:
            return `${month}/${day}`;
    }
};

const mergeDataByRange = (data: AnalyticsResponse.DailyIncome[], range: TimeRange): AnalyticsResponse.DailyIncome[] => {
    console.log('data:', data);
    if (!data || data.length === 0) return [];
    const mergedData: { [key: string]: AnalyticsResponse.DailyIncome } = {};

    data.forEach(item => {
        const date = new Date(item.date);
        const key = formatDateByRange(date, range);
        if (!mergedData[key]) {
            mergedData[key] = {
                date: key,
                totalAmount: 0,
                totalCount: 0,
            };
        }

        mergedData[key].totalAmount += item.totalAmount;
        mergedData[key].totalCount += item.totalCount;
    });

    return Object.values(mergedData);
};

const transformData = (data: AnalyticsResponse.DailyIncome[], range: TimeRange): { transformedData: AnalyticsResponse.DailyIncome[]; totalAmount: number; totalCount: number } => {
    if (!data) return { transformedData: [], totalAmount: 0, totalCount: 0 };

    const dailyData = data.map(item => ({
        date: item.date,
        totalAmount: item.totalAmount,
        totalCount: item.totalCount
    }));

    const transformedData = mergeDataByRange(dailyData, range);
    const totalAmount = data.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalCount = data.reduce((sum, item) => sum + item.totalCount, 0);

    return { transformedData, totalAmount, totalCount };
};

export const useAnalytics = ({ siteId }: UseAnalyticsProps): UseAnalyticsReturn => {
    const [incomeData, setIncomeData] = useState<AnalyticsResponse.DailyIncome[]>([]);
    const [transactions, setTransactions] = useState<AnalyticsResponse.IncomeTransaction[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
    const [timeRange, setTimeRange] = useState<TimeRange>('month');

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const endTime = Math.floor(Date.now() / 1000);
            const startTime = endTime - getTimeRangeInSeconds('month');

            const incomeResponse = await AnalyticsApi.getIncomeStatistics({
                siteId,
                startTime,
                endTime
            });

            if (incomeResponse.code === 0 && incomeResponse.data) {
                const { transformedData, totalAmount, totalCount } = transformData(incomeResponse.data.items, timeRange);
                setIncomeData(transformedData);
                setTotalAmount(totalAmount);
                setTotalCount(totalCount);
            } else {
                toast.error('Failed to fetch income statistics');
            }
        } catch (error) {
            console.error('Error fetching income statistics:', error);
            toast.error('Failed to fetch income statistics');
        } finally {
            setIsLoading(false);
        }
    }, [siteId, timeRange]);

    const fetchTransactions = useCallback(async () => {
        try {
            setIsTransactionsLoading(true);
            const endTime = Math.floor(Date.now() / 1000);
            const startTime = endTime - getTimeRangeInSeconds('month');

            const transactionsResponse = await AnalyticsApi.getIncomeTransactions({
                siteId,
                startTime,
                endTime,
                page: 1,
                pageSize: 6 // 只获取前6条记录
            });

            if (transactionsResponse.code === 0 && transactionsResponse.data) {
                setTransactions(transactionsResponse.data.items);
            } else {
                toast.error('Failed to fetch transactions');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to fetch transactions');
        } finally {
            setIsTransactionsLoading(false);
        }
    }, [siteId]);

    return {
        incomeData,
        transactions,
        totalAmount,
        totalCount,
        isLoading,
        isTransactionsLoading,
        timeRange,
        setTimeRange,
        fetchData,
        fetchTransactions
    };
}; 