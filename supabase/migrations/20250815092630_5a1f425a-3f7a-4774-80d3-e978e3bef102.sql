-- Add missing columns for "other" fields in gig economy and quick commerce selections
ALTER TABLE public.contacts 
ADD COLUMN gig_economy_other TEXT,
ADD COLUMN quick_commerce_other TEXT;