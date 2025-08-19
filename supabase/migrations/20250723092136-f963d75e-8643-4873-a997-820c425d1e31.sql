-- Add separate first and last name fields for contact person
ALTER TABLE public.contacts 
ADD COLUMN contact_person_first_name TEXT,
ADD COLUMN contact_person_last_name TEXT;

-- Migrate existing data: try to split existing contact_person_name if it exists
UPDATE public.contacts 
SET 
  contact_person_first_name = CASE 
    WHEN contact_person_name IS NOT NULL AND position(' ' in contact_person_name) > 0 
    THEN split_part(contact_person_name, ' ', 1)
    ELSE contact_person_name
  END,
  contact_person_last_name = CASE 
    WHEN contact_person_name IS NOT NULL AND position(' ' in contact_person_name) > 0 
    THEN substring(contact_person_name from position(' ' in contact_person_name) + 1)
    ELSE NULL
  END
WHERE contact_person_name IS NOT NULL;

-- Drop the old field after migration
ALTER TABLE public.contacts DROP COLUMN contact_person_name;