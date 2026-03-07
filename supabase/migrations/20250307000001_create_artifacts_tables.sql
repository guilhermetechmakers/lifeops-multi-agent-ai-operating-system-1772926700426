-- LifeOps Artifact Storage Schema
-- Artifacts, versions, retention policies, scans

-- Retention policies (tenant-scoped)
CREATE TABLE IF NOT EXISTS retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  retention_period_days INTEGER NOT NULL DEFAULT 90,
  max_versions INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Artifacts (metadata store)
CREATE TABLE IF NOT EXISTS artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  content_item_id UUID,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'application/octet-stream',
  size BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  current_version_id UUID,
  retention_policy_id UUID REFERENCES retention_policies(id),
  status TEXT NOT NULL DEFAULT 'pending_scan' CHECK (status IN ('pending_scan', 'clean', 'infected', 'quarantined', 'deleted')),
  description TEXT,
  tags JSONB DEFAULT '[]'::jsonb
);

-- Artifact versions (artifact_id references artifacts, so create after artifacts)
CREATE TABLE IF NOT EXISTS artifact_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  s3_key TEXT NOT NULL,
  checksum TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  uploaded_by UUID,
  signed_url_expires_at TIMESTAMPTZ,
  UNIQUE(artifact_id, version_number)
);

-- Add FK from artifact_versions to artifacts
ALTER TABLE artifact_versions
  ADD CONSTRAINT fk_artifact_versions_artifact
  FOREIGN KEY (artifact_id) REFERENCES artifacts(id) ON DELETE CASCADE;

-- Add FK from artifacts to artifact_versions (current_version_id nullable initially)
ALTER TABLE artifacts
  ADD CONSTRAINT fk_current_version
  FOREIGN KEY (current_version_id) REFERENCES artifact_versions(id);

-- Scans (virus scan results)
CREATE TABLE IF NOT EXISTS artifact_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_version_id UUID NOT NULL REFERENCES artifact_versions(id) ON DELETE CASCADE,
  result TEXT NOT NULL CHECK (result IN ('pass', 'fail')),
  scanned_at TIMESTAMPTZ DEFAULT now(),
  scanner_name TEXT,
  details JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_artifacts_tenant ON artifacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_content_item ON artifacts(content_item_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_status ON artifacts(status);
CREATE INDEX IF NOT EXISTS idx_artifacts_created ON artifacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artifact_versions_artifact ON artifact_versions(artifact_id);

-- RLS (Row Level Security)
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifact_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifact_scans ENABLE ROW LEVEL SECURITY;

-- Policy: users can access artifacts in their tenant (simplified for MVP)
CREATE POLICY "Users can read own tenant artifacts"
  ON artifacts FOR SELECT
  USING (true);

CREATE POLICY "Users can insert artifacts"
  ON artifacts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update artifacts"
  ON artifacts FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete artifacts"
  ON artifacts FOR DELETE
  USING (true);
