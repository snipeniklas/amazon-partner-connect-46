-- Allow public updates for contact forms
-- This is needed for the public form to work without authentication
DROP POLICY IF EXISTS "Users can update contacts" ON public.contacts;

CREATE POLICY "Anyone can update contacts for form submission" 
ON public.contacts 
FOR UPDATE 
USING (true);