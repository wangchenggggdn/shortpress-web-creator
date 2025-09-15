/**
 * Common response interface for API calls
 */
export interface IResponse<T = any> {
    /** Response status code */
    code: number;
    /** Response message */
    info: string;
    /** Response data */
    data: T;
}

/**
 * Interface for pagination parameters
 */
export interface IPaginationParams {
    /** Current page number */
    page: number;
    /** Number of items per page */
    pageSize: number;
}

/**
 * Interface for paginated response data
 */
export interface IPaginationResponse<T> {
    /** Total number of items */
    total: number;
    /** Array of items for current page */
    items: T[];
    /** Current page number */
    page: number;
    /** Number of items per page */
    pageSize: number;
    /** Whether there are more items */
    hasMore: boolean;
}