/**
 * videolib 资源地址（不再追加 `?v=` 做缓存穿透）。
 */
export function withResMediaCacheBust(url: string | undefined, _version?: number): string | undefined {
    if (!url) return url;
    const u = url.trim();
    if (!u) return u;
    if (!u.includes('videolib/') && !u.includes('/media/videolib')) return u;
    return u;
}
