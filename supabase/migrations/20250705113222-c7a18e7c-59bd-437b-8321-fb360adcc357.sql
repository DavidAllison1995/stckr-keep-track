-- Generate a demo user UUID and create the account
DO $$
DECLARE
  demo_user_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;
BEGIN
  -- Create demo user for reviewers (if not exists)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    demo_user_id,
    'authenticated',
    'authenticated',
    'demo@stckr.app',
    '$2a$10$7O5sNfQgm7e/Mz7nF2DfTue.7j7L6Q1b9JtV8nO2xY3kC5pM8cRiW', -- hashed password for 'demo123'
    NOW(),
    NOW(),
    NOW(),
    '{"first_name": "Demo", "last_name": "User"}'::jsonb
  ) ON CONFLICT (email) DO NOTHING;

  -- Create corresponding profile for the demo user
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    is_admin
  ) VALUES (
    demo_user_id,
    'Demo',
    'User',
    false
  ) ON CONFLICT (id) DO NOTHING;
END $$;