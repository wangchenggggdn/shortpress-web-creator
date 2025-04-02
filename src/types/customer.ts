export interface Customer {
    email: string;
    nickname?: string;
    status: CustomerStatus;
    createdAt: number;  // timestamp
    lastLoginAt: number; // timestamp
    updatedAt: number;  // timestamp
}

export enum CustomerStatus {
    ACTIVE = 2,
    BLOCKED = 3,
    DELETED = 127
}

export interface CustomerSearchParams {
    keyword?: string;
    page?: number;
    pageSize?: number;
    siteId: string;
} 