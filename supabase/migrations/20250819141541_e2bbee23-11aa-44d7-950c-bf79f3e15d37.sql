-- Create settings table for Meta Pixel configuration
CREATE TABLE public.meta_pixel_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  market_type TEXT NOT NULL,
  target_market TEXT NOT NULL,
  pixel_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(market_type, target_market)
);

-- Enable Row Level Security
ALTER TABLE public.meta_pixel_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for meta pixel settings access
CREATE POLICY "Users can view meta pixel settings based on permissions" 
ON public.meta_pixel_settings 
FOR SELECT 
USING (
  CASE
    WHEN (auth.uid() IS NULL) THEN false
    ELSE ( SELECT
            CASE
                WHEN perms.is_admin THEN true
                WHEN ((array_length(perms.allowed_markets, 1) = 0) AND (array_length(perms.allowed_market_types, 1) = 0)) THEN true
                WHEN ((array_length(perms.allowed_markets, 1) = 0) AND (meta_pixel_settings.market_type = ANY (perms.allowed_market_types))) THEN true
                WHEN ((array_length(perms.allowed_market_types, 1) = 0) AND (meta_pixel_settings.target_market = ANY (perms.allowed_markets))) THEN true
                WHEN ((meta_pixel_settings.target_market = ANY (perms.allowed_markets)) AND (meta_pixel_settings.market_type = ANY (perms.allowed_market_types))) THEN true
                ELSE false
            END AS "case"
       FROM get_user_permissions(auth.uid()) perms(allowed_markets, allowed_market_types, is_admin))
  END
);

CREATE POLICY "Users can create meta pixel settings based on permissions" 
ON public.meta_pixel_settings 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  ( SELECT
      CASE
          WHEN perms.is_admin THEN true
          WHEN ((array_length(perms.allowed_markets, 1) = 0) AND (array_length(perms.allowed_market_types, 1) = 0)) THEN true
          WHEN ((array_length(perms.allowed_markets, 1) = 0) AND (meta_pixel_settings.market_type = ANY (perms.allowed_market_types))) THEN true
          WHEN ((array_length(perms.allowed_market_types, 1) = 0) AND (meta_pixel_settings.target_market = ANY (perms.allowed_markets))) THEN true
          WHEN ((meta_pixel_settings.target_market = ANY (perms.allowed_markets)) AND (meta_pixel_settings.market_type = ANY (perms.allowed_market_types))) THEN true
          ELSE false
      END AS "case"
 FROM get_user_permissions(auth.uid()) perms(allowed_markets, allowed_market_types, is_admin))
);

CREATE POLICY "Users can update meta pixel settings based on permissions" 
ON public.meta_pixel_settings 
FOR UPDATE 
USING (
  auth.uid() = user_id AND
  ( SELECT
      CASE
          WHEN perms.is_admin THEN true
          WHEN ((array_length(perms.allowed_markets, 1) = 0) AND (array_length(perms.allowed_market_types, 1) = 0)) THEN true
          WHEN ((array_length(perms.allowed_markets, 1) = 0) AND (meta_pixel_settings.market_type = ANY (perms.allowed_market_types))) THEN true
          WHEN ((array_length(perms.allowed_market_types, 1) = 0) AND (meta_pixel_settings.target_market = ANY (perms.allowed_markets))) THEN true
          WHEN ((meta_pixel_settings.target_market = ANY (perms.allowed_markets)) AND (meta_pixel_settings.market_type = ANY (perms.allowed_market_types))) THEN true
          ELSE false
      END AS "case"
 FROM get_user_permissions(auth.uid()) perms(allowed_markets, allowed_market_types, is_admin))
)
WITH CHECK (
  auth.uid() = user_id AND
  ( SELECT
      CASE
          WHEN perms.is_admin THEN true
          WHEN ((array_length(perms.allowed_markets, 1) = 0) AND (array_length(perms.allowed_market_types, 1) = 0)) THEN true
          WHEN ((array_length(perms.allowed_markets, 1) = 0) AND (meta_pixel_settings.market_type = ANY (perms.allowed_market_types))) THEN true
          WHEN ((array_length(perms.allowed_market_types, 1) = 0) AND (meta_pixel_settings.target_market = ANY (perms.allowed_markets))) THEN true
          WHEN ((meta_pixel_settings.target_market = ANY (perms.allowed_markets)) AND (meta_pixel_settings.market_type = ANY (perms.allowed_market_types))) THEN true
          ELSE false
      END AS "case"
 FROM get_user_permissions(auth.uid()) perms(allowed_markets, allowed_market_types, is_admin))
);

CREATE POLICY "Users can delete meta pixel settings based on permissions" 
ON public.meta_pixel_settings 
FOR DELETE 
USING (
  auth.uid() = user_id AND
  ( SELECT
      CASE
          WHEN perms.is_admin THEN true
          WHEN ((array_length(perms.allowed_markets, 1) = 0) AND (array_length(perms.allowed_market_types, 1) = 0)) THEN true
          WHEN ((array_length(perms.allowed_markets, 1) = 0) AND (meta_pixel_settings.market_type = ANY (perms.allowed_market_types))) THEN true
          WHEN ((array_length(perms.allowed_market_types, 1) = 0) AND (meta_pixel_settings.target_market = ANY (perms.allowed_markets))) THEN true
          WHEN ((meta_pixel_settings.target_market = ANY (perms.allowed_markets)) AND (meta_pixel_settings.market_type = ANY (perms.allowed_market_types))) THEN true
          ELSE false
      END AS "case"
 FROM get_user_permissions(auth.uid()) perms(allowed_markets, allowed_market_types, is_admin))
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_meta_pixel_settings_updated_at
BEFORE UPDATE ON public.meta_pixel_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();