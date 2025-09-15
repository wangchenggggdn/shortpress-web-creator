import fetch from '@/libs/fetch/fetch';
import { Customer } from '@/types/customer';
import { IPaginationResponse } from '@/types/public';
import { CustomerArgs } from './args';
import { UserResponse } from './respones';
import { CoinTransaction, VideoUnlockTransaction } from '@/types/payment';
export default class CustomerApi {
    /**
     * Get customer list with pagination
     */
    static list(args: CustomerArgs.Search) {
        return fetch.get<IPaginationResponse<Customer>>('/api/site/user/list', args);
    }

    /**
     * Get customer detail information
     */
    static getInfo(args: CustomerArgs.GetInfo) {
        return fetch.get<Customer>('/api/site/user/info', args);
    }

    /**
     * Change customer status
     */
    static changeStatus(args: CustomerArgs.ChangeStatus) {
        return fetch.post('/api/site/user/change/status', args);
    }

    /**
     * Get user's coin balance
     */
    static getCoinBalance() {
        return fetch.get<UserResponse.UserCoinsResponse>('/api/user/coins/balance');
    }

    /**
     * Get user's coin transaction history
     */
    static getCoinTransactions(args: CustomerArgs.GetCoinTransactions) {
        return fetch.get<IPaginationResponse<CoinTransaction>>('/api/user/coins/transactions', args);
    }

    /**
     * Get user's video unlock transaction history
     */
    static getVideoUnlockTransactions(args: CustomerArgs.GetVideoUnlockTransactions) {
        return fetch.get<IPaginationResponse<VideoUnlockTransaction>>('/api/user/coins/videos/transactions', args);
    }
} 