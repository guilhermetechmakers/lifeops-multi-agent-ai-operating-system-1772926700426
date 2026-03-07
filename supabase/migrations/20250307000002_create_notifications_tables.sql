-- LifeOps Notifications & Alerts Schema
-- notifications, digests, channels, templates, approvals_queue, audit_logs

-- Channel preferences per user
CREATE TABLE IF NOT EXISTS notification_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  in_app BOOLEAN NOT NULL DEFAULT true,
  email BOOLEAN NOT NULL DEFAULT true,
  push BOOLEAN NOT NULL DEFAULT false,
  digest_enabled BOOLEAN NOT NULL DEFAULT false,
  digest_frequency TEXT NOT NULL DEFAULT 'daily' CHECK (digest_frequency IN ('immediate', 'daily', 'weekly', 'monthly')),
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  subject TEXT,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  last_modified TIMESTAMPTZ DEFAULT now()
);

-- Digests (batched notification windows)
CREATE TABLE IF NOT EXISTS notification_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  delivered_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed'))
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email', 'push')),
  template_id UUID REFERENCES notification_templates(id),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed', 'snoozed', 'read')),
  digest_id UUID REFERENCES notification_digests(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  persisted_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ,
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT
);

-- Approvals queue (scheduled cron actions requiring approval)
CREATE TABLE IF NOT EXISTS approvals_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cronjob_id UUID NOT NULL,
  requestor_id UUID NOT NULL,
  rationale TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'conditional')),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  diff_blob JSONB DEFAULT '{}'::jsonb
);

-- Audit logs
CREATE TABLE IF NOT EXISTS notification_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  object_type TEXT NOT NULL,
  object_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_channel ON notifications(channel);
CREATE INDEX IF NOT EXISTS idx_approvals_queue_status ON approvals_queue(status);
CREATE INDEX IF NOT EXISTS idx_approvals_queue_cronjob ON approvals_queue(cronjob_id);
CREATE INDEX IF NOT EXISTS idx_notification_channels_user ON notification_channels(user_id);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (true);

CREATE POLICY "Users can read own channels"
  ON notification_channels FOR SELECT
  USING (true);

CREATE POLICY "Users can update own channels"
  ON notification_channels FOR UPDATE
  USING (true);

CREATE POLICY "Users can insert channels"
  ON notification_channels FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read templates"
  ON notification_templates FOR SELECT
  USING (true);

CREATE POLICY "Users can read approvals"
  ON approvals_queue FOR SELECT
  USING (true);

CREATE POLICY "Users can update approvals"
  ON approvals_queue FOR UPDATE
  USING (true);
