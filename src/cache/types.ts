import type { Keyv, KeyvStoreAdapter } from 'keyv';

/**
 * Supported cache provider types.
 */
export type CacheProvider = 'memory' | 'valkey';

/**
 * Configuration for a single cache store.
 */
export interface CacheStoreOptions {
  /** Cache provider type. */
  provider: CacheProvider;
  /** Connection URL (required for valkey, ignored for memory). */
  url?: string;
  /** Namespace for key prefixing. */
  namespace?: string;
  /** Default TTL in milliseconds. */
  ttl?: number;
}

/**
 * Options for configCache().
 */
export interface ConfigCacheOptions {
  /**
   * Cache store configurations.
   * If not provided, parsed from CACHE_URLS environment variable.
   */
  stores?: CacheStoreOptions[];
  /** Default TTL in milliseconds for all stores. */
  ttl?: number;
  /** If true, register as global module. Default: true. */
  isGlobal?: boolean;
  /** If true, allow non-blocking multi-store operations. Default: false. */
  nonBlocking?: boolean;
  /** If true, suppress connection error logs. Default: false. */
  silent?: boolean;
}

/**
 * Result of parsing CACHE_URLS.
 */
export interface ParsedCacheUrl {
  /** Resolved provider type. */
  provider: CacheProvider;
  /** The URL string (empty for memory). */
  url: string;
}

/**
 * Internal store instance created by adapters.
 */
export interface CacheStoreInstance {
  /** The Keyv store adapter. */
  store: Keyv | KeyvStoreAdapter;
  /** Provider type. */
  provider: CacheProvider;
  /** Namespace used. */
  namespace: string;
}
