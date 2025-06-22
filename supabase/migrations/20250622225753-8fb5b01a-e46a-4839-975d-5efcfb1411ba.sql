
-- Add the missing stripe_session_id column to the orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT UNIQUE;
