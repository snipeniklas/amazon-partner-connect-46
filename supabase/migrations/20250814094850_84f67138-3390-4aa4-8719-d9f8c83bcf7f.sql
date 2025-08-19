-- Update the INSERT policy to allow anonymous form submissions
DROP POLICY IF EXISTS "Users can create contacts" ON public.contacts;

CREATE POLICY "Anyone can create contacts for form submissions" 
ON public.contacts 
FOR INSERT 
WITH CHECK (true);