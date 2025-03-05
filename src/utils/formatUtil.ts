import dayjs from 'dayjs';

/**
 * Format date and time
 * @param date Date to format
 * @param format Format string (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns Formatted date string
 */
const dateFormat = (date: string | Date | number, format?: string) => {
    return dayjs(date).format(format ?? 'YYYY-MM-DD HH:mm:ss');
};

/**
 * Format Unix timestamp in seconds
 * @param date Unix timestamp in seconds
 * @param format Format string (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns Formatted date string
 */
const dateFormatSecond = (date: number, format?: string) => {
    return dayjs(date * 1000).format(format ?? 'YYYY-MM-DD HH:mm:ss');
};

export { dateFormat, dateFormatSecond };
