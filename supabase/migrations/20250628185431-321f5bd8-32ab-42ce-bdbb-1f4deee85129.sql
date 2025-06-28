
-- Add missing columns to orders table for better tracking
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS shipping_phone TEXT,
ADD COLUMN IF NOT EXISTS printful_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS printful_error TEXT,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- Create webhook_logs table for debugging
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_type TEXT NOT NULL,
  event_data JSONB,
  processing_status TEXT DEFAULT 'received',
  error_message TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on webhook_logs
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create admin policy for webhook logs
CREATE POLICY "Admins can view webhook logs" ON public.webhook_logs
  FOR SELECT USING (public.is_user_admin(auth.uid()));

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON public.orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_printful_order ON public.orders(printful_order_id);
