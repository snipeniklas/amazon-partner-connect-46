-- Create contact_comments table
CREATE TABLE public.contact_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contact_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for contact_comments
-- Users can view comments for contacts they have access to
CREATE POLICY "Users can view comments for accessible contacts"
  ON public.contact_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts 
      WHERE contacts.id = contact_comments.contact_id
      AND (
        CASE
          WHEN (auth.uid() IS NULL) THEN true
          ELSE ( SELECT
                  CASE
                      WHEN perms.is_admin THEN true
                      WHEN ((array_length(perms.allowed_markets, 1) = 0) AND (array_length(perms.allowed_market_types, 1) = 0)) THEN true
                      WHEN ((array_length(perms.allowed_markets, 1) = 0) AND (contacts.market_type = ANY (perms.allowed_market_types))) THEN true
                      WHEN ((array_length(perms.allowed_market_types, 1) = 0) AND (contacts.target_market = ANY (perms.allowed_markets))) THEN true
                      WHEN ((contacts.target_market = ANY (perms.allowed_markets)) AND (contacts.market_type = ANY (perms.allowed_market_types))) THEN true
                      ELSE false
                  END AS "case"
             FROM get_user_permissions(auth.uid()) perms(allowed_markets, allowed_market_types, is_admin))
        END
      )
    )
  );

-- Users can create comments for accessible contacts
CREATE POLICY "Users can create comments for accessible contacts"
  ON public.contact_comments
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.contacts 
      WHERE contacts.id = contact_comments.contact_id
      AND (
        CASE
          WHEN (auth.uid() IS NULL) THEN true
          ELSE ( SELECT
                  CASE
                      WHEN perms.is_admin THEN true
                      WHEN ((array_length(perms.allowed_markets, 1) = 0) AND (array_length(perms.allowed_market_types, 1) = 0)) THEN true
                      WHEN ((array_length(perms.allowed_markets, 1) = 0) AND (contacts.market_type = ANY (perms.allowed_market_types))) THEN true
                      WHEN ((array_length(perms.allowed_market_types, 1) = 0) AND (contacts.target_market = ANY (perms.allowed_markets))) THEN true
                      WHEN ((contacts.target_market = ANY (perms.allowed_markets)) AND (contacts.market_type = ANY (perms.allowed_market_types))) THEN true
                      ELSE false
                  END AS "case"
             FROM get_user_permissions(auth.uid()) perms(allowed_markets, allowed_market_types, is_admin))
        END
      )
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON public.contact_comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON public.contact_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contact_comments_updated_at
  BEFORE UPDATE ON public.contact_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();