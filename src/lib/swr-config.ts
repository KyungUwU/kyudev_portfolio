import { SWRConfiguration, KeyedMutator } from "swr";

export interface FetchError extends Error {
  status?: number;
  info?: string;
}

export const fetcher = async <T = unknown>(url: string): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      const err: FetchError = new Error("Failed to fetch");
      err.status = res.status;
      err.info = await res.text();
      throw err;
    }
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const swrConfig: SWRConfiguration = {
  fetcher,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  revalidateIfStale: true,
  refreshInterval: 30 * 60 * 1000,
  dedupingInterval: 10 * 60 * 1000,
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  shouldRetryOnError: (err: FetchError) =>
    err?.status && err.status >= 400 && err.status < 500 ? false : true,
  keepPreviousData: true,
};

export const githubProjectsConfig: SWRConfiguration = {
  ...swrConfig,
  refreshInterval: 15 * 60 * 1000,
  dedupingInterval: 5 * 60 * 1000,
};

export const cacheKeys = {
  githubProjects: "/api/github",
  githubProject: (repo: string) => `/api/github/${repo}`,
} as const;

export async function mutateGitHubProjects<T>(
  mutate: KeyedMutator<T>,
  updater?: T | Promise<T> | ((c: T | undefined) => T | Promise<T>)
) {
  return mutate(cacheKeys.githubProjects, updater, {
    revalidate: false,
    populateCache: true,
  });
}

export async function clearCache<T>(mutate: KeyedMutator<T>, key: string) {
  return mutate(key, undefined, { revalidate: false });
}
