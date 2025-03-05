/**
 * Extended Window interface with analytics and tracking functionality
 */
interface Window {
    /** Google Analytics global object */
    gtag: any;
    /** Analytics tracking object */
    ta: {
        /** Initialize analytics with configuration */
        init: (config: any) => void;
        /** Track user login event */
        login: (id: string) => void;
        /** Set user properties */
        userSet: (config: any) => void;
        /** Set super properties for tracking */
        setSuperProperties: (config: any) => void;
        /** Track custom event */
        track: (eventName: string, value?: any) => void;
        /** Quick track event */
        quick: (name: string, value: any) => void;
        /** Flush tracking data */
        flush: () => void;
        /** Get distinct user ID */
        getDistinctId: () => string;
        /** Set distinct user ID */
        setDistinctId: (name: string) => void;
        /** Track first-time event */
        trackFirst: (params: any) => void;
    };
}
