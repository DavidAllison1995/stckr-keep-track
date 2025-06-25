
-- Enable the pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable the pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the notification generation function to run every day at midnight UTC
SELECT cron.schedule(
  'generate-daily-notifications',
  '0 0 * * *', -- Every day at midnight UTC
  $$
  SELECT
    net.http_post(
        url:='https://cudftlquaydissmvqjmv.supabase.co/functions/v1/generate-notifications',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZGZ0bHF1YXlkaXNzbXZxam12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNzkwNTksImV4cCI6MjA2NTg1NTA1OX0.f6_TmpyKF6VtQJL65deTrEdNnag6sSQw-eYWYUtQgaQ"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Optional: Also run every 6 hours to catch tasks more frequently
SELECT cron.schedule(
  'generate-frequent-notifications',
  '0 */6 * * *', -- Every 6 hours
  $$
  SELECT
    net.http_post(
        url:='https://cudftlquaydissmvqjmv.supabase.co/functions/v1/generate-notifications',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZGZ0bHF1YXlkaXNzbXZxam12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNzkwNTksImV4cCI6MjA2NTg1NTA1OX0.f6_TmpyKF6VtQJL65deTrEdNnag6sSQw-eYWYUtQgaQ"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);
