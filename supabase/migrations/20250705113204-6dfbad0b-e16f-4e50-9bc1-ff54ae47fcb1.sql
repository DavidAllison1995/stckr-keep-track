-- Create demo user for reviewers
-- Note: This will create a user in auth.users with a known email and password
-- The user will be auto-confirmed for immediate access

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
  confirmation_token,
  recovery_token,
  email_change_token_new,
  raw_user_meta_data,
  raw_app_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'demo-user-0000-0000-0000-000000000001'::uuid,
  'authenticated',
  'authenticated',
  'demo@stckr.app',
  '$2a$10$M4oYyQ.3zJWgJmBpITdm9O8pj.2vdBcF6x/qZbN1Q2m7V8X9l0oG2', -- password: demo123
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '{"first_name": "Demo", "last_name": "User"}',
  '{}'
) ON CONFLICT (email) DO NOTHING;

-- Create corresponding profile for the demo user
INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  is_admin
) VALUES (
  'demo-user-0000-0000-0000-000000000001'::uuid,
  'Demo',
  'User',
  false
) ON CONFLICT (id) DO NOTHING;