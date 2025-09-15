export enum AdFormat {
    DISPLAY = 1,
    INTERSTITIAL = 2,
    NATIVE = 3,
    REWARDED = 4
}

export enum AdStatus {
    ACTIVE = 1,
    PAUSED = 2,
    ARCHIVED = 3
}

export enum AdNetwork {
    GOOGLE = 'google',
    FACEBOOK = 'facebook',
    ADMOB = 'admob'
}

export interface AdUnit {
    adId?: string;
    adNetwork: string;
    clientId: string;
    format: number;
    frequency: number;
    name: string;
    page: string;
    siteId: string;
    status: number;
    unitId: string;
}