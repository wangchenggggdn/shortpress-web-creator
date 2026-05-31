/**
 * Response types for API operations
 */

import { CoinPackage } from '@/types/payment';

export namespace PaymentResponse {
    /**
     * Payment account information response
     */
    export interface PaymentAccountInfo {
        accountId: string; // Account ID
        country: string; // Country/Region
        email: string; // Account email
    }

    /**
     * Coin package creation response
     */
    export interface CoinPackageCreateResponse {
        packageId: string; // Package ID
    }

    /**
     * Coin package list response
     */
    export interface CoinPackageResponseData {
        packages: CoinPackage[]; // Array of coin packages
    }

    /**
     * Payment order creation response
     */
    export interface OrderCreateResponse {
        orderId: string; // Order ID
        checkoutUrl: string; // Checkout URL
        cancelUrl: string; // Cancel URL
        clientSecret: string; // Client secret
        status: string; // Order status
        expiresAt: string; // Expiration date
        successUrl: string; // Success URL
    }

    /**
     * Payment configuration response
     */
    export interface PaymentConfig {
        paypal?: {
            clientId: string; // PayPal client ID
            clientSecret: string; // PayPal client secret
            isSandbox: boolean; // PayPal sandbox mode
        };
        stripe?: {
            email: string; // Stripe account email
            pk: string; // Stripe publishable key
            sk: string; // Stripe secret key
            isSandbox: boolean; // Stripe sandbox mode
        };
    }

    export interface GrantCoins {
        amountAdded: number; // Amount added to user's balance
        currentBalance: number; // Current balance after addition
        transactionId: string; // Transaction ID
        userEmail: string; // User's email
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
        balance: number; // Current coin balance
        totalEarned: number; // Total coins earned
        totalSpent: number; // Total coins spent
        totalRealMoneySpent: number; // Total real money spent
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
        date: string; // Date in YYYY-MM-DD format
        totalAmount: number; // Income amount
        transactionCount: number; // Transaction count
        iapAmount: number; // In-app purchase (coin package) revenue
        subscriptionAmount: number; // New subscription revenue
        renewalAmount: number; // Subscription renewal revenue
    }

    /**
     * Income transaction record
     */
    export interface IncomeTransaction {
        transactionId: string; // Transaction ID
        amount: number; // Transaction amount
        createdAt: number; // Transaction creation timestamp
        description: string; // Transaction description
        email: string; // Customer email
        name: string; // Customer name
        provider: string; // Payment provider
    }

    /**
     * Income transaction history response
     */
    export interface IncomeTransactionHistory {
        page: number; // Current page number
        pageSize: number; // Items per page
        total: number; // Total number of items
        transactions: IncomeTransaction[]; // Transaction list
    }

    export interface IncomeTransactionInfo {
        transactionId: string; // Transaction ID
        amount: number; // Transaction amount
        currency: string; // Transaction currency
        status: number; // Transaction status
        provider: string; // Payment provider
        createdAt: number; // Transaction creation timestamp
        email: string; // Customer email
        name: string; // Customer name
        paymentType: number; // Payment type
        relatedId: string; // Related ID
        relatedType: number; // Related type
        userId: string; // User ID
    }
}
