export enum SubscriptionStatus {
    Active = 1,
    Paused = 2,
    Deleted = 3,
}

// export interface Subscription {
//     id: string;
//     name: string;
//     billingPeriod: string;
//     price: number;
//     discountPrice: number;
//     status: SubscriptionStatus;
//     description?: string;
// }

export interface SubscriptionData {
    packageId?: string;
    siteId: string;
    name: string;
    description?: string;
    interval: string; // weekly, monthly, yearly
    price: number;
    originalPrice?: number;
    discountPercentage?: number;
    currency?: string;
    status: number;
    createdAt?: number;
} 