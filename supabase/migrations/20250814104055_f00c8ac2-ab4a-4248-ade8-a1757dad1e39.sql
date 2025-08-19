-- Add user profile fields for better user management
ALTER TABLE public.user_profiles 
ADD COLUMN email TEXT,
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Update the trigger function to populate these fields from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id, 
    is_admin,
    email,
    first_name,
    last_name
  )
  VALUES (
    NEW.id, 
    true, -- New users get admin access by default for backward compatibility
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

-- Update existing profiles with email from auth.users
UPDATE public.user_profiles 
SET email = (
  SELECT email 
  FROM auth.users 
  WHERE auth.users.id = user_profiles.user_id
)
WHERE email IS NULL;