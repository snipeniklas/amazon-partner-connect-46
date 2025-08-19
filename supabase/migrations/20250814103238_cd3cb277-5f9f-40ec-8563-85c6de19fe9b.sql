-- Fix security issues by setting search_path for functions
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid UUID)
RETURNS TABLE(
  allowed_markets TEXT[],
  allowed_market_types TEXT[],
  is_admin BOOLEAN
) 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE
SET search_path = ''
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, is_admin)
  VALUES (NEW.id, true); -- New users get admin access by default for backward compatibility
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;