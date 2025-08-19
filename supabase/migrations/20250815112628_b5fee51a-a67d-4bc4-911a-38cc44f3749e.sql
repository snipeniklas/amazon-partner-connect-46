-- Fix the get_user_permissions function to return correct array types
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid uuid)
 RETURNS TABLE(allowed_markets text[], allowed_market_types text[], is_admin boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(p.allowed_markets, '{}'::text[]),
    COALESCE(p.allowed_market_types, '{}'::text[]),
    COALESCE(p.is_admin, false)
  FROM public.user_profiles p
  WHERE p.user_id = user_uuid;
  
  -- If no profile exists, return admin permissions (backward compatibility)
  -- Fixed: Use proper text[] array casting instead of text
  IF NOT FOUND THEN
    RETURN QUERY SELECT '{}'::text[], '{}'::text[], true;
  END IF;
END;
$function$