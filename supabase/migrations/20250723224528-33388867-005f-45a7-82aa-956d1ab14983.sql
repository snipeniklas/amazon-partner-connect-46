-- Update email_sent flag for contacts that have resend_email_id but email_sent is false
UPDATE contacts 
SET email_sent = true, 
    email_sent_at = COALESCE(email_sent_at, now())
WHERE resend_email_id IS NOT NULL 
  AND (email_sent = false OR email_sent IS NULL);