/**
 * Response types for API operations
 */

import { CoinPackage } from "@/types/payment";

export namespace PaymentResponse {
    /**
     * Payment account information response
     */
    export interface PaymentAccountInfo {
        accountId: string;  // Account ID
        country: string;    // Country/Region
        email: string;      // Account email
    }

    /**
     * Coin package creation response
     */
    export interface CoinPackageCreateResponse {
        packageId: string;
    }

    /**
     * Coin package list response
     */
    export interface CoinPackageResponseData {
        packages: CoinPackage[];
    }

    /**
     * Payment order creation response
     */
    export interface OrderCreateResponse {
        orderId: string;
        checkoutUrl: string;
        cancelUrl: string;
        clientSecret: string;
        status: string;
        expiresAt: string;
        successUrl: string;
    }

    /**
     * Payment configuration response
     */
    export interface PaymentConfig {
        paypal?: {
            clientId: string;     // PayPal client ID
        };
        stripe?: {
            email: string;        // Stripe account email
            pk: string;          // Stripe publishable key
            sk: string;          // Stripe secret key
        };
    }

    export interface GrantCoins {
        amountAdded: number;
        currentBalance: number;
        transactionId: string;
        userEmail: string;
    }
}

/**
 * Response types for User related operations
 */
export namespace UserResponse {
    /**
     * User coins balance response
     */
    export interface UserCoinsResponse {
        balance: number;        // Current coin balance
        totalEarned: number;    // Total coins earned
        totalSpent: number;     // Total coins spent
        totalTransactions: number; // Total transactions
    }
}

/**
 * Response types for Analytics related operations
 */
export namespace AnalyticsResponse {
    /**
     * Daily income statistics data
     */
    export interface DailyIncome {
        date: string;      // Date in YYYY-MM-DD format
        totalAmount: number;    // Income amount
        totalCount: number;     // Transaction count
    }


    /**
     * Income transaction record
     */
    export interface IncomeTransaction {
        transactionId: string;     // Transaction ID
        amount: number;           // Transaction amount
        createdAt: number;        // Transaction creation timestamp
        description: string;      // Transaction description
        email: string;           // Customer email
        name: string;            // Customer name
        provider: string;        // Payment provider
    }

    /**
     * Income transaction history response
     */
    export interface IncomeTransactionHistory {
        page: number;           // Current page number
        pageSize: number;       // Items per page
        total: number;          // Total number of items
        transactions: IncomeTransaction[];  // Transaction list
    }

    export interface IncomeTransactionInfo {
        transactionId: string;
        amount: number;
        currency: string;
        status: number;
        provider: string;
        createdAt: number;
        email: string;
        name: string;
        paymentType: number;
        relatedId: string;
        relatedType: number;
        userId: string;
    }
}