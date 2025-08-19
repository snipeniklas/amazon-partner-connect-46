-- Create email tracking table for Resend integration
CREATE TABLE public.email_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  email_id TEXT NOT NULL, -- Resend email ID
  event_type TEXT NOT NULL, -- sent, delivered, opened, clicked, bounced, complained
  event_data JSONB DEFAULT '{}', -- Additional event data from Resend
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies - all users can see all tracking data
CREATE POLICY "All users can view email tracking" 
ON public.email_tracking 
FOR SELECT 
USING (true);

CREATE POLICY "System can insert email tracking" 
ON public.email_tracking 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_email_tracking_contact_id ON public.email_tracking(contact_id);
CREATE INDEX idx_email_tracking_email_id ON public.email_tracking(email_id);
CREATE INDEX idx_email_tracking_event_type ON public.email_tracking(event_type);
CREATE INDEX idx_email_tracking_timestamp ON public.email_tracking(timestamp DESC);

-- Add email_id field to contacts table to track Resend email IDs
ALTER TABLE public.contacts ADD COLUMN resend_email_id TEXT;