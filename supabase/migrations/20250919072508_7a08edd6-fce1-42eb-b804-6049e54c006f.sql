-- Add scooter-related fields to contacts table
ALTER TABLE public.contacts 
ADD COLUMN uses_scooters boolean,
ADD COLUMN willing_to_acquire_scooters boolean,
ADD COLUMN scooter_count integer,
ADD COLUMN scooter_types text[];