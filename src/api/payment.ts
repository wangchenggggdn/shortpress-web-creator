import { IPaginationResponse, IResponse } from "@/types/public";
import { PaymentArgs } from "./args";
import { PaymentResponse, UserResponse } from "./respones";
import fetch from '@/libs/fetch/fetch';
import { CoinPackage, CoinTransaction, VideoUnlockTransaction } from "@/types/payment";



/**
 * Payment related API class
 */
export class PaymentAPI {
    /**
     * Get payment account information
     * @param args Payment account info parameters
     * @returns Promise with account information
     */
    static getAccountInfo(args: PaymentArgs.GetAccountInfo) {
        return fetch.get<PaymentResponse.PaymentAccountInfo>('/api/payment/account/info', args);
    }

    /**
     * Create a new coin package
     * @param args Coin package creation parameters
     * @returns Promise with package ID
     */
    static createCoinPackage(args: PaymentArgs.CreateCoinPackage) {
        return fetch.post<PaymentResponse.CoinPackageCreateResponse>('/api/payment/coins/package/create', args);
    }

    /**
     * Get list of coin packages
     * @param args List parameters
     * @returns Promise with coin package list
     */
    static getCoinPackageList(args: PaymentArgs.GetCoinPackageList) {
        return fetch.get<CoinPackage[]>('/api/payment/coins/package/list', args);
    }

    /**
     * Modify an existing coin package
     * @param args Coin package modification parameters
     * @returns Promise with modified package information
     */
    static modifyCoinPackage(args: PaymentArgs.ModifyCoinPackage) {
        return fetch.post<PaymentResponse.CoinPackageCreateResponse>('/api/payment/coins/package/modify', args);
    }

    /**
     * Save payment configuration
     * @param args Payment configuration parameters
     * @returns Promise
     */
    static saveConfig(args: PaymentArgs.SaveConfig) {
        return fetch.post<IResponse>('/api/payment/conf/save', args);
    }

    /**
     * Test payment configuration
     * @param args Payment configuration parameters
     * @returns Promise
     */
    static testConfig(args: PaymentArgs.TestConfig) {
        return fetch.post<IResponse>('/api/payment/conf/test', args);
    }

    /**
     * Get payment configuration information
     * @param args Payment configuration parameters
     * @returns Promise with payment configuration
     */
    static getConfig(args: PaymentArgs.GetConfig) {
        return fetch.get<PaymentResponse.PaymentConfig>('/api/payment/conf/info', args);
    }



    /**
     * Create a payment order
     * @param args Order creation parameters
     * @returns Promise with order information and payment URLs
     */
    static createOrder(args: PaymentArgs.CreateOrder) {
        return fetch.post<PaymentResponse.OrderCreateResponse>('/api/payment/order/create', args);
    }

    /**
     * Get coin transaction history
     * @param args Coin transactions parameters
     * @returns Promise with transaction history data
     */
    static getCoinTransactions(args: PaymentArgs.CoinTransactions) {
        return fetch.get<IPaginationResponse<CoinTransaction>>('/api/payment/customers/coins/transactions', args);
    }

    /**
     * Get video unlock transaction history
     * @param args Video unlock transactions parameters
     * @returns Promise with transaction history data
     */
    static getVideoUnlockTransactions(args: PaymentArgs.VideoUnlockTransactions) {
        return fetch.get<IPaginationResponse<VideoUnlockTransaction>>('/api/payment/customers/coins/videos/transactions', args);
    }

    /**
     * Grant coins to a specific user
     * @param args Grant coins request parameters
     * @returns Promise with grant coins response
     */
    static grantCoins(args: PaymentArgs.GrantCoins) {
        return fetch.post<PaymentResponse.GrantCoins>('/api/payment/customers/coins/grant', args);
    }

    /**
     * Get user's coin balance
     * @param args User coins balance parameters
     * @returns Promise with user's coin balance information
     */
    static getCoinBalance(args: PaymentArgs.GetUserCoinsBalance) {
        return fetch.get<UserResponse.UserCoinsResponse>('/api/payment/customers/coins/balance', args);
    }


}