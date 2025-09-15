import fetch from '@/libs/fetch/fetch';
import { AnalyticsArgs } from './args';
import { AnalyticsResponse } from './respones';
import { IPaginationResponse } from '@/types/public';
/**
 * API class for analytics related operations
 */
export default class AnalyticsApi {
    /**
     * Get income statistics for a site
     * @param args Income statistics parameters
     * @returns Promise with income statistics data
     */
    static getIncomeStatistics(args: AnalyticsArgs.IncomeStatistics) {
        return fetch.post<IPaginationResponse<AnalyticsResponse.DailyIncome>>('/api/analytics/income/statistics', args);
    }

    /**
     * Get income transaction history for a site
     * @param args Income transactions parameters
     * @returns Promise with transaction history data
     */
    static getIncomeTransactions(args: AnalyticsArgs.IncomeTransactions) {
        return fetch.post<IPaginationResponse<AnalyticsResponse.IncomeTransaction>>('/api/analytics/income/transactions', args);
    }

    /**
     * Get detailed information about a specific income transaction
     * @param args Transaction info parameters
     * @returns Promise with transaction information
     */
    static getIncomeTransactionInfo(args: AnalyticsArgs.IncomeTransactionInfo) {
        return fetch.get<AnalyticsResponse.IncomeTransactionInfo>('/api/analytics/income/transactions/info', args);
    }
} 