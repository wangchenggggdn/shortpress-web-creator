import { IPaginationResponse, IResponse } from "@/types/public";
import { PaymentArgs } from "./args";
import { PaymentResponse } from "./respone";
import fetch from '@/libs/fetch/fetch';
import { CoinPackage } from "@/types/payment";


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
     * Create a payment order
     * @param args Order creation parameters
     * @returns Promise with order information and payment URLs
     */
    static createOrder(args: PaymentArgs.CreateOrder) {
        return fetch.post<PaymentResponse.OrderCreateResponse>('/api/payment/order/create', args);
    }
}