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