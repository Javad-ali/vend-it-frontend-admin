/**
 * Cache Management Types
 */

export interface CacheStats {
  [key: string]: any; // Redis stats structure
}

export interface CacheStatsResponse {
  status: number;
  message: string;
  data: CacheStats;
}

export interface CacheClearResponse {
  status: number;
  message: string;
  data: null;
}
