-- Update meta_pixel_settings table to store complete pixel code instead of just ID
ALTER TABLE public.meta_pixel_settings 
DROP COLUMN pixel_id;

ALTER TABLE public.meta_pixel_settings 
ADD COLUMN pixel_code TEXT NOT NULL DEFAULT '';