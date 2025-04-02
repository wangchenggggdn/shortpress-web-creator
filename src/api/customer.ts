import fetch from '@/libs/fetch/fetch';
import { Customer } from '@/types/customer';
import { IPaginationResponse } from '@/types/public';
import { CustomerArgs } from './args';

export default class CustomerApi {
    /**
     * Get customer list with pagination
     */
    static list(args: CustomerArgs.Search) {
        return fetch.get<IPaginationResponse<Customer>>('/api/site/user/list', args);
    }

    /**
     * Get customer detail information
     */
    static getInfo(args: CustomerArgs.GetInfo) {
        return fetch.get<Customer>('/api/site/user/info', args);
    }

    /**
     * Change customer status
     */
    static changeStatus(args: CustomerArgs.ChangeStatus) {
        return fetch.post('/api/site/user/change/status', args);
    }
} 