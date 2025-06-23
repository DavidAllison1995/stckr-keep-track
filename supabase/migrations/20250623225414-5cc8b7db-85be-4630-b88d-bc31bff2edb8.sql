
-- Add printful_order_id column to orders table
ALTER TABLE public.orders 
ADD COLUMN printful_order_id TEXT;

-- Add fulfillment_error column to track any fulfillment issues
ALTER TABLE public.orders 
ADD COLUMN fulfillment_error TEXT;
