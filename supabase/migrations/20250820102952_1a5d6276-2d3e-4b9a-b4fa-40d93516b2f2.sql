-- Add bicycle_types column to contacts table
ALTER TABLE public.contacts 
ADD COLUMN bicycle_types TEXT[];