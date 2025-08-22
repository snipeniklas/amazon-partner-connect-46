-- Add geocoding columns to contacts table
ALTER TABLE public.contacts 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN geocoded_at TIMESTAMP WITH TIME ZONE;