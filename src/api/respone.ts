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
    }

    /**
     * Coin transaction record
     */
    export interface CoinTransaction {
        transactionId: string;  // Transaction ID
        type: number;           // Transaction type
        amount: number;         // Transaction amount
        beforeBalance: number;  // Balance before transaction
        balance: number;        // Balance after transaction
        description: string;    // Transaction description
        source: string;         // Transaction source
        relatedType: number;    // Related transaction type
        createdAt: number;      // Transaction creation timestamp
    }

    /**
     * Transaction history response
     */
    export interface TransactionHistoryResponse {
        page: number;           // Current page number
        pageSize: number;       // Items per page
        total: number;          // Total number of items
        transactions: CoinTransaction[];  // Transaction list
    }

    /**
     * Video unlock transaction record
     */
    export interface VideoUnlockTransaction {
        transactionId: string;  // Transaction ID
        contentType: string;    // Content type ("video" or "playlist")
        contentId: string;      // Content ID
        playlistId?: string;    // Playlist ID (if content is a video)
        coinCost: number;       // Coins spent
        unlockedAt: number;     // Unlock timestamp
        expiredAt?: number;     // Expiration timestamp (if any)
    }
}