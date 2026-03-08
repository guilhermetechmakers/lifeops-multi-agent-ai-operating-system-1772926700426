# Performance & Optimization — Runbook

## Overview

This runbook covers the Performance & Optimization layer for LifeOps: caching, indexing, metrics, tracing, and the Cronjobs / Master Dashboard surfaces.

## Caching (Redis)

- **Cache keys**: Use namespaced keys (e.g. `lifeops:cronjobs:list`, `lifeops:agents:*`). TTLs: 5–10 min for lists, 1–2 min for detail/run data.
- **Invalidation**: On create/update/delete of cronjobs, agents, or templates, invalidate the matching key pattern. Use cache-aside: delete on write, then refill on next read.
- **CDN**: For static assets and large payloads, set `Cache-Control` and optionally `Stale-While-Revalidate`. Prefetch critical API responses where appropriate.

## Indexing & Search

- **Full-text index**: Cronjobs, agent workflows, and command templates should be indexed (e.g. RedisSearch or external search). Trigger incremental indexing on insert/update; support facets: status, timezone, trigger type, permissions.
- **Indexing latency**: Monitor time from write to index visibility. Alert if latency exceeds SLA (e.g. &gt; 60s).

## Metrics (Prometheus)

- **Collect**: Request latency (p50, p99), error rate, cronjob queue depth, backoff/retry counts, cache hit/miss, SLA adherence.
- **Scrape**: Expose `/metrics` (or equivalent) for Prometheus. Use consistent labels (module, endpoint, status).

## Tracing (Jaeger / OpenTelemetry)

- **Spans**: Emit spans for API calls, cronjob scheduling, run execution, and inter-agent handoffs. Propagate trace ID in headers and logs.
- **Frontend**: Run detail and drawer show `traceId` when available; link to Jaeger UI if configured.

## Backup & Recovery

- **Cadence**: Daily backups for cronjobs, templates, and run artifacts; retain per policy (e.g. 30 days).
- **Recovery**: Document point-in-time restore procedure and RTO/RPO. Runbooks for restore and verification.

## Cronjobs Dashboard

- **CRUD**: Create, update, delete via API; enable/disable and bulk actions with validation.
- **Schedule builder**: Validate expressions via `POST /cronjobs/schedule-validate`; show human-readable preview and next run.
- **Detail drawer**: From list, “View details” opens drawer with run history; selecting a run shows logs and trace ID.

## Master Dashboard

- **Global search**: Consumes search index; results by module (cronjobs, templates, alerts, etc.) with quick actions.
- **Quick command bar**: Same as global search (⌘K); launch templates or navigate to resources.
- **Alerts**: Cross-module alert stream; acknowledge/snooze via API.
- **Workflows recent**: `GET /master-dashboard/workflows/recent` for recently used workflows; use for quick re-run.

## Troubleshooting

- **High latency**: Check cache hit rate and index latency; scale read replicas or cache nodes if needed.
- **Cronjob not firing**: Verify schedule expression and timezone; check queue depth and worker health.
- **Missing trace**: Ensure tracing is enabled and trace ID is passed through all layers; verify Jaeger collector is receiving spans.
