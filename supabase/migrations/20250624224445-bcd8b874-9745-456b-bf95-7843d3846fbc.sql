
-- Create shipping_addresses table to store customer shipping information
CREATE TABLE public.shipping_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view shipping addresses for their own orders
CREATE POLICY "Users can view shipping addresses for their orders" 
  ON public.shipping_addresses 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = shipping_addresses.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Create policy for edge functions to insert shipping addresses
CREATE POLICY "Insert shipping addresses" 
  ON public.shipping_addresses 
  FOR INSERT 
  WITH CHECK (true);
