
-- Check what the current check constraint allows (using correct PostgreSQL system columns)
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.maintenance_tasks'::regclass 
AND contype = 'c';

-- Drop the existing check constraint
ALTER TABLE public.maintenance_tasks 
DROP CONSTRAINT IF EXISTS maintenance_tasks_status_check;

-- Add the correct check constraint that matches our application's status types
ALTER TABLE public.maintenance_tasks 
ADD CONSTRAINT maintenance_tasks_status_check 
CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue', 'due_soon'));
