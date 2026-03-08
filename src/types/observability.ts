/**
 * Performance & Optimization observability types.
 * Cache health, indexing latency, metrics, and tracing for LifeOps.
 * Use (data ?? []) and Array.isArray when consuming API responses.
 */

export interface CacheHealthMetric {
  key: string;
  hitRate: number;
  missRate: number;
  size?: number;
  ttlSeconds?: number;
  lastInvalidated?: string;
}

export interface IndexingLatencyMetric {
  indexName: string;
  lastIndexedAt: string;
  latencyMs: number;
  documentCount?: number;
}

export interface ObservabilityDashboardSummary {
  cacheHealth: CacheHealthMetric[];
  indexingLatency: IndexingLatencyMetric[];
  requestLatencyP99?: number;
  errorRate?: number;
  cronjobQueueDepth?: number;
}

export interface TraceSpan {
  spanId: string;
  traceId: string;
  name: string;
  startTime: string;
  endTime?: string;
  durationMs?: number;
  attributes?: Record<string, string | number>;
}

export interface BackupRecoveryConfig {
  cadence: string;
  retentionDays: number;
  pointInTimeRestoreEnabled: boolean;
}
