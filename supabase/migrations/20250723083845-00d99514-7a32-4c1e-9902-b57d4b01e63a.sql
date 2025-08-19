-- Create contacts table for Amazon partner platform
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Basic company information (required fields)
  company_name TEXT NOT NULL,
  email_address TEXT NOT NULL,
  
  -- Optional basic fields
  company_address TEXT,
  legal_form TEXT,
  website TEXT,
  contact_person_name TEXT,
  contact_person_position TEXT,
  phone_number TEXT,
  
  -- Logistics questionnaire fields
  is_last_mile_logistics BOOLEAN,
  last_mile_since_when TEXT,
  operating_cities TEXT[],
  food_delivery_services BOOLEAN,
  food_delivery_platforms TEXT[],
  staff_types TEXT[],
  full_time_drivers INTEGER,
  vehicle_types TEXT[],
  transporter_count INTEGER,
  amazon_experience BOOLEAN,
  
  -- City availability (storing as JSONB for flexibility)
  city_availability JSONB DEFAULT '{}',
  
  -- Email status
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  form_completed BOOLEAN DEFAULT FALSE,
  form_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policies - all users can see all contacts
CREATE POLICY "All users can view all contacts" 
ON public.contacts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create contacts" 
ON public.contacts 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update contacts" 
ON public.contacts 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete contacts" 
ON public.contacts 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX idx_contacts_company_name ON public.contacts(company_name);
CREATE INDEX idx_contacts_email ON public.contacts(email_address);
CREATE INDEX idx_contacts_email_sent ON public.contacts(email_sent);
CREATE INDEX idx_contacts_form_completed ON public.contacts(form_completed);