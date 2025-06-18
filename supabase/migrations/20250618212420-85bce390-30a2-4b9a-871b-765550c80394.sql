
-- Add recurrence fields to maintenance_tasks table
ALTER TABLE public.maintenance_tasks 
ADD COLUMN recurrence_rule TEXT NULL,
ADD COLUMN parent_task_id UUID NULL REFERENCES public.maintenance_tasks(id) ON DELETE CASCADE;

-- Add index for better performance when querying parent-child relationships
CREATE INDEX idx_maintenance_tasks_parent_id ON public.maintenance_tasks(parent_task_id);

-- Add index for recurrence queries
CREATE INDEX idx_maintenance_tasks_recurrence ON public.maintenance_tasks(recurrence_rule) WHERE recurrence_rule IS NOT NULL;
