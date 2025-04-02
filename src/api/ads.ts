import fetch from '@/libs/fetch/fetch';
import { AdsArgs } from './args';
import { AdUnit } from '@/types/ads';

/**
 * API class for advertising related operations
 */
export default class AdsApi {
    /**
     * Create a new advertising unit
     * @param args Ad unit creation parameters
     * @returns Promise with created ad unit
     */
    static create(args: AdsArgs.Create) {
        return fetch.post('/api/ads/unit/create', args);
    }

    /**
     * Modify an existing advertising unit
     * @param args Ad unit modification parameters
     * @returns Promise with updated ad unit
     */
    static modify(args: AdsArgs.Modify) {
        return fetch.post('/api/ads/unit/modify', args);
    }

    /**
     * Get list of advertising units for a site
     * @param args List parameters including siteId
     * @returns Promise with array of ad units
     */
    static list(args: AdsArgs.List) {
        return fetch.get<{ items: AdUnit[] }>('/api/ads/unit/list', {
            siteId: args.siteId
        });
    }
}



