import { unstable_cache } from "next/cache";

type CacheKeyPart = string | number | boolean | null | undefined;

export function buildReadCacheKey(namespace: string, parts: CacheKeyPart[]) {
  return [namespace, ...parts.map((part) => String(part ?? "null"))];
}

export function buildReadCacheTags(baseTag: string, scopedTag?: string) {
  return scopedTag ? [baseTag, `${baseTag}:${scopedTag}`] : [baseTag];
}

type ReadCacheOptions = {
  revalidate?: number;
  baseTag?: string;
  scopedTag?: string;
};

export async function withReadCache<T>(
  namespace: string,
  parts: CacheKeyPart[],
  loader: () => Promise<T>,
  options: ReadCacheOptions = {},
) {
  const cachedLoader = unstable_cache(loader, buildReadCacheKey(namespace, parts), {
    revalidate: options.revalidate ?? 60,
    tags: buildReadCacheTags(options.baseTag ?? namespace, options.scopedTag),
  });

  return cachedLoader();
}
