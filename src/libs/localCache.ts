/**
 * Local storage cache utility
 * Provides methods for managing data in browser's localStorage
 */
const LocalCache = {
    /**
     * Store a value in localStorage
     * @param key The key to store the value under
     * @param val The value to store
     */
    set(key: string, val: any) {
        window.localStorage.setItem(key, JSON.stringify(val));
    },

    /**
     * Retrieve a value from localStorage
     * @param key The key to retrieve
     * @returns The stored value, or null if not found
     */
    get(key: string) {
        const json = window.localStorage.getItem(key);
        return JSON.parse(json as string);
    },

    /**
     * Remove a value from localStorage
     * @param key The key to remove
     */
    remove(key: string) {
        window.localStorage.removeItem(key);
    },

    /**
     * Clear all values from localStorage
     */
    clear() {
        window.localStorage.clear();
    },
};

export default LocalCache;
