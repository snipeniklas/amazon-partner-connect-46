-- Create user profiles table with permissions
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  allowed_markets TEXT[] DEFAULT '{}',
  allowed_market_types TEXT[] DEFAULT '{}',
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can update all profiles" 
ON public.user_profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "System can insert profiles" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (true);

-- Create security definer function to get user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid UUID)
RETURNS TABLE(
  allowed_markets TEXT[],
  allowed_market_types TEXT[],
  is_admin BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(p.allowed_markets, '{}'),
    COALESCE(p.allowed_market_types, '{}'),
    COALESCE(p.is_admin, false)
  FROM public.user_profiles p
  WHERE p.user_id = user_uuid;
  
  -- If no profile exists, return admin permissions (backward compatibility)
  IF NOT FOUND THEN
    RETURN QUERY SELECT '{}', '{}', true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Update contacts RLS policies to use permissions
DROP POLICY IF EXISTS "All users can view all contacts" ON public.contacts;

CREATE POLICY "Users can view contacts based on permissions" 
ON public.contacts 
FOR SELECT 
USING (
  CASE 
    WHEN auth.uid() IS NULL THEN true -- Allow public access for form submissions
    ELSE (
      SELECT 
        CASE 
          WHEN perms.is_admin THEN true
          WHEN array_length(perms.allowed_markets, 1) = 0 AND array_length(perms.allowed_market_types, 1) = 0 THEN true
          WHEN array_length(perms.allowed_markets, 1) = 0 AND contacts.market_type = ANY(perms.allowed_market_types) THEN true
          WHEN array_length(perms.allowed_market_types, 1) = 0 AND contacts.target_market = ANY(perms.allowed_markets) THEN true
          WHEN contacts.target_market = ANY(perms.allowed_markets) AND contacts.market_type = ANY(perms.allowed_market_types) THEN true
          ELSE false
        END
      FROM public.get_user_permissions(auth.uid()) perms
    )
  END
);

-- Create trigger for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, is_admin)
  VALUES (NEW.id, true); -- New users get admin access by default for backward compatibility
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();