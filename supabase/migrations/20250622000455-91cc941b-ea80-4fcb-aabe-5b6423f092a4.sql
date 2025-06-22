
-- First, let's check the current constraint and update it to include 'item_created'
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('task_due_soon', 'task_overdue', 'warranty_expiring', 'task_completed', 'task_created', 'item_created'));
