import { useState, useCallback } from 'react';
import AnalyticsApi from '@/api/analytics';
import { AnalyticsResponse } from '@/api/respones';
import { toast } from 'sonner';
import LocalCache from '@/libs/localCache';

export type TimeRange = 'day' | '3days' | 'week' | 'month';

/** Chart day-bucketing timezone presets */
export type ChartTimezone = 'utc-8' | 'utc-7' | 'local';

const CHART_TIMEZONE_STORAGE_KEY = 'analytics.chartTimezone';

export const CHART_TIMEZONE_OPTIONS: { label: string; value: ChartTimezone }[] = [
    { label: 'UTC-8', value: 'utc-8' },
    { label: 'UTC-7', value: 'utc-7' },
    { label: 'Local', value: 'local' },
];

const isChartTimezone = (value: unknown): value is ChartTimezone =>
    value === 'utc-8' || value === 'utc-7' || value === 'local';

const readStoredChartTimezone = (): ChartTimezone => {
    if (typeof window === 'undefined') return 'local';
    try {
        const raw = window.localStorage.getItem(CHART_TIMEZONE_STORAGE_KEY);
        if (!raw) return 'local';
        const parsed = JSON.parse(raw);
        // Migrate legacy keys from earlier UTC+8 / utc8 / utc7 values
        if (parsed === 'utc8' || parsed === 'utc+8') return 'utc-8';
        if (parsed === 'utc7') return 'utc-7';
        return isChartTimezone(parsed) ? parsed : 'local';
    } catch {
        return 'local';
    }
};

/** Minutes east of UTC for the selected chart timezone */
export const getTimezoneOffsetMinutes = (tz: ChartTimezone): number => {
    switch (tz) {
        case 'utc-8':
            return -8 * 60;
        case 'utc-7':
            return -7 * 60;
        case 'local':
            // getTimezoneOffset is minutes west of UTC
            return -new Date().getTimezoneOffset();
        default:
            return -new Date().getTimezoneOffset();
    }
};

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
    chartTimezone: ChartTimezone;
    setChartTimezone: (tz: ChartTimezone) => void;
    fetchData: () => Promise<void>;
    fetchTransactions: () => Promise<void>;
    total: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
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

/** Parse API calendar date YYYY-MM-DD without UTC→local shift */
const parseCalendarDateParts = (dateStr: string): { month: number; day: number } | null => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
    if (!match) return null;
    return { month: Number(match[2]), day: Number(match[3]) };
};

const formatDateByRange = (dateStr: string, range: TimeRange): string => {
    const parts = parseCalendarDateParts(dateStr);
    if (!parts) return dateStr;
    const { month, day } = parts;

    switch (range) {
        case 'day':
            return dateStr; // keep YYYY-MM-DD for chart axis
        case '3days':
            const group = Math.floor((day - 1) / 3) * 3 + 1;
            return `${month}/${group}-${group + 2}`;
        case 'week':
            const week = Math.ceil(day / 7);
            return `${month}/W${week}`;
        case 'month':
            return `${month}/M`;
        default:
            return dateStr;
    }
};

const mergeDataByRange = (data: AnalyticsResponse.DailyIncome[], range: TimeRange): AnalyticsResponse.DailyIncome[] => {
    if (!data || data.length === 0) return [];
    const mergedData: { [key: string]: AnalyticsResponse.DailyIncome } = {};

    data.forEach(item => {
        const key = formatDateByRange(item.date, range);
        if (!mergedData[key]) {
            mergedData[key] = {
                date: key,
                totalAmount: 0,
                transactionCount: 0,
                iapAmount: 0,
                subscriptionAmount: 0,
                renewalAmount: 0,
            };
        }

        mergedData[key].totalAmount += item.totalAmount;
        mergedData[key].transactionCount += item.transactionCount;
        mergedData[key].iapAmount += item.iapAmount;
        mergedData[key].subscriptionAmount += item.subscriptionAmount;
        mergedData[key].renewalAmount += item.renewalAmount;
    });

    return Object.values(mergedData);
};

/** Reconcile API breakdown with daily total; never move renewal into subscription. */
const normalizeDailyIncome = (item: AnalyticsResponse.DailyIncome): AnalyticsResponse.DailyIncome => {
    const totalAmount = item.totalAmount ?? 0;
    let iapAmount = item.iapAmount ?? 0;
    let subscriptionAmount = item.subscriptionAmount ?? 0;
    const renewalAmount = item.renewalAmount ?? 0;
    let breakdownSum = iapAmount + subscriptionAmount + renewalAmount;

    if (totalAmount > breakdownSum) {
        const remainder = totalAmount - breakdownSum;
        if (renewalAmount > 0) {
            subscriptionAmount += remainder;
        } else if (iapAmount > 0 && subscriptionAmount === 0) {
            iapAmount += remainder;
        } else {
            subscriptionAmount += remainder;
        }
        breakdownSum = totalAmount;
    } else if (breakdownSum > totalAmount && totalAmount > 0) {
        const ratio = totalAmount / breakdownSum;
        iapAmount *= ratio;
        subscriptionAmount *= ratio;
        // renewalAmount kept proportional via recalc from total
        const scaledRenewal = renewalAmount * ratio;
        return {
            ...item,
            totalAmount,
            transactionCount: item.transactionCount ?? 0,
            iapAmount,
            subscriptionAmount,
            renewalAmount: scaledRenewal,
        };
    }

    return {
        ...item,
        totalAmount,
        transactionCount: item.transactionCount ?? 0,
        iapAmount,
        subscriptionAmount,
        renewalAmount,
    };
};

const transformData = (data: AnalyticsResponse.DailyIncome[], range: TimeRange): { transformedData: AnalyticsResponse.DailyIncome[]; totalAmount: number; totalCount: number } => {
    if (!data) return { transformedData: [], totalAmount: 0, totalCount: 0 };

    // Sort data by date in ascending order
    const sortedData = [...data].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
    });

    const dailyData = sortedData.map(item => normalizeDailyIncome(item));

    const transformedData = mergeDataByRange(dailyData, range);
    const totalAmount = data.reduce((sum, item) => sum + (item.totalAmount ?? 0), 0);
    const totalCount = data.reduce((sum, item) => sum + (item.transactionCount ?? 0), 0);

    return { transformedData, totalAmount, totalCount };
};

export const useAnalytics = ({ siteId }: UseAnalyticsProps): UseAnalyticsReturn => {
    const [incomeData, setIncomeData] = useState<AnalyticsResponse.DailyIncome[]>([]);
    const [transactions, setTransactions] = useState<AnalyticsResponse.IncomeTransaction[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
    const [timeRange, setTimeRange] = useState<TimeRange>('day');
    const [chartTimezone, setChartTimezoneState] = useState<ChartTimezone>(readStoredChartTimezone);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const setChartTimezone = useCallback((tz: ChartTimezone) => {
        setChartTimezoneState(tz);
        LocalCache.set(CHART_TIMEZONE_STORAGE_KEY, tz);
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const endTime = Math.floor(Date.now() / 1000);
            const startTime = endTime - getTimeRangeInSeconds('month');

            const incomeResponse = await AnalyticsApi.getIncomeStatistics({
                siteId,
                startTime,
                endTime,
                timezoneOffset: getTimezoneOffsetMinutes(chartTimezone),
            });

            if (incomeResponse.code === 0 && incomeResponse.data) {
                const { transformedData, totalAmount, totalCount } = transformData(incomeResponse.data.items, timeRange);
                setIncomeData(transformedData);
                setTotalAmount(totalAmount);
                setTotalCount(totalCount);
                setTotal(incomeResponse.data.total);
                setPage(incomeResponse.data.page);
                setPageSize(incomeResponse.data.pageSize);
            } else {
                toast.error('Failed to fetch income statistics');
            }
        } catch (error) {
            console.error('Error fetching income statistics:', error);
            toast.error('Failed to fetch income statistics');
        } finally {
            setIsLoading(false);
        }
    }, [siteId, timeRange, chartTimezone]);

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
                pageSize: 6 // Get only first 6 records
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

    const onPageChange = (newPage: number) => {
        setPage(newPage);
        fetchData();
    };

    return {
        incomeData,
        transactions,
        totalAmount,
        totalCount,
        isLoading,
        isTransactionsLoading,
        timeRange,
        setTimeRange,
        chartTimezone,
        setChartTimezone,
        fetchData,
        fetchTransactions,
        total,
        page,
        pageSize,
        onPageChange
    };
};
