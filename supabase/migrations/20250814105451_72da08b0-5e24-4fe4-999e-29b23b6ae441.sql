-- Add market tracking fields to email_tracking table
ALTER TABLE public.email_tracking 
ADD COLUMN market_type TEXT,
ADD COLUMN target_market TEXT;

-- Add index for better performance on market queries
CREATE INDEX idx_email_tracking_market ON public.email_tracking (market_type, target_market);