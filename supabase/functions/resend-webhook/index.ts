import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Get environment variables with proper error handling
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");

// Validate required environment variables
if (!supabaseUrl) {
  console.error("Missing SUPABASE_URL environment variable");
  throw new Error("Missing SUPABASE_URL environment variable");
}

if (!supabaseServiceKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
}

if (!webhookSecret) {
  console.error("Missing RESEND_WEBHOOK_SECRET environment variable");
  throw new Error("Missing RESEND_WEBHOOK_SECRET environment variable");
}

console.log("Environment variables loaded successfully");

// Create Supabase client with service role for database operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

// Verify Svix signature
const verifySignature = async (payload: string, headers: Headers): Promise<boolean> => {
  const svixId = headers.get('svix-id');
  const svixTimestamp = headers.get('svix-timestamp');
  const svixSignature = headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error('Missing required svix headers');
    return false;
  }

  // Create the signed payload
  const signedPayload = `${svixId}.${svixTimestamp}.${payload}`;
  
  // Create HMAC signature
  const encoder = new TextEncoder();
  
  // Decode the webhook secret from base64 if it starts with whsec_
  let secretBytes;
  if (webhookSecret.startsWith('whsec_')) {
    const base64Secret = webhookSecret.replace('whsec_', '');
    const binaryString = atob(base64Secret);
    secretBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      secretBytes[i] = binaryString.charCodeAt(i);
    }
  } else {
    secretBytes = encoder.encode(webhookSecret);
  }
  
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  // Extract signature from header (format: v1,signature)
  const receivedSignature = svixSignature.split(',')[1];
  
  console.log('Expected signature:', expectedSignature);
  console.log('Received signature:', receivedSignature);
  
  return expectedSignature === receivedSignature;
};

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    to: string[];
    from: string;
    subject: string;
    timestamp?: string;
    click?: {
      link: string;
      timestamp: string;
    };
    open?: {
      timestamp: string;
    };
    bounce?: {
      type: string;
      reason: string;
    };
    complaint?: {
      type: string;
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    
    // Verify webhook signature
    const isValidSignature = await verifySignature(payload, req.headers);
    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const event: ResendWebhookEvent = JSON.parse(payload);
    
    console.log(`Received Resend webhook event: ${event.type} for email ${event.data.email_id}`);

    // Find contact by resend_email_id
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('id')
      .eq('resend_email_id', event.data.email_id)
      .single();

    if (contactError || !contact) {
      console.error(`Contact not found for email ID: ${event.data.email_id}`);
      return new Response("Contact not found", { status: 404, headers: corsHeaders });
    }

    // Map Resend event types to our tracking events
    let eventType: string;
    let eventData: any = {
      to: event.data.to,
      from: event.data.from,
      subject: event.data.subject,
      timestamp: event.data.timestamp || event.created_at
    };

    switch (event.type) {
      case 'email.sent':
        eventType = 'sent';
        break;
      case 'email.delivered':
        eventType = 'delivered';
        break;
      case 'email.delivery_delayed':
        eventType = 'delayed';
        eventData.delay_reason = event.data;
        break;
      case 'email.opened':
        eventType = 'opened';
        eventData.open_timestamp = event.data.open?.timestamp;
        break;
      case 'email.clicked':
        eventType = 'clicked';
        eventData.clicked_link = event.data.click?.link;
        eventData.click_timestamp = event.data.click?.timestamp;
        break;
      case 'email.bounced':
        eventType = 'bounced';
        eventData.bounce_type = event.data.bounce?.type;
        eventData.bounce_reason = event.data.bounce?.reason;
        break;
      case 'email.complained':
        eventType = 'complained';
        eventData.complaint_type = event.data.complaint?.type;
        break;
      default:
        console.log(`Unknown event type: ${event.type}`);
        return new Response("Unknown event type", { status: 400, headers: corsHeaders });
    }

    // Insert tracking record
    const { error: insertError } = await supabase
      .from('email_tracking')
      .insert({
        contact_id: contact.id,
        email_id: event.data.email_id,
        event_type: eventType,
        event_data: eventData,
        timestamp: new Date(event.data.timestamp || event.created_at).toISOString()
      });

    if (insertError) {
      console.error('Error inserting tracking record:', insertError);
      return new Response("Database error", { status: 500, headers: corsHeaders });
    }

    console.log(`Successfully recorded ${eventType} event for contact ${contact.id}`);

    return new Response(JSON.stringify({ success: true, event_type: eventType }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);