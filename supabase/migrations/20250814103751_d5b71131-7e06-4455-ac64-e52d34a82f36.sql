-- Fix infinite recursion in user_profiles RLS policies

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;

-- Create security definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
DECLARE
  is_admin_result BOOLEAN;
BEGIN
  SELECT COALESCE(p.is_admin, false) INTO is_admin_result
  FROM public.user_profiles p
  WHERE p.user_id = auth.uid();
  
  -- If no profile exists, return false (not admin)
  RETURN COALESCE(is_admin_result, false);
END;
$$;

-- Create new policies using the security definer function
CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (public.is_current_user_admin() = true);

CREATE POLICY "Admins can update all profiles" 
ON public.user_profiles 
FOR UPDATE 
USING (public.is_current_user_admin() = true);