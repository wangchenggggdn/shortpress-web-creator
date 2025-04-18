/**
 * Payment related type definitions
 */

/**
 * Package status enum
 */
export enum PackageStatus {
    Disabled = 0,   // Disabled
    Enabled = 1,    // Enabled
    Deleted = 2     // Deleted
}

/**
 * Coin package plan
 */
export interface CoinPackage {
    packageId?: string;      // Package ID, not required when creating
    siteId: string;         // Site ID
    name: string;           // Package name
    description?: string;   // Package description
    coinAmount: number;     // Amount of coins
    price: number;         // Price
    originalPrice?: number; // Original price
    discountPercentage?: number; // Discount percentage
    currency?: string;     // Currency type
    status: PackageStatus; // Status
    createdAt?: string;    // Creation time
    updatedAt?: string;    // Update time
}


/**
 * Transaction history response
 */
export interface CoinTransaction {
    transactionId: string;
    type: number;
    amount: number;
    beforeBalance: number;
    balance: number;
    description: string;
    source: string;
    relatedType: number;
    createdAt: number;
    snapshot?: Record<string, any>;
}


export interface IncomeTransaction {
    transactionId: string;     // Transaction ID
    amount: number;           // Transaction amount
    createdAt: number;        // Transaction creation timestamp
    description: string;      // Transaction description
    email: string;           // Customer email
    name: string;            // Customer name
    provider: string;        // Payment provider
}


export interface VideoUnlockTransaction {
    transactionId: string;
    contentId: string;
    contentType: 'video' | 'playlist';
    coinCost: number;
    unlockedAt: number;
    expiredAt?: number;
    playlistId?: string;
}


