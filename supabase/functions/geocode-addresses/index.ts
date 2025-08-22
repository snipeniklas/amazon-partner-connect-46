import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Contact {
  id: string;
  company_address?: string;
  operating_cities?: string[];
  latitude?: number;
  longitude?: number;
}

interface GeocodeResponse {
  lat: string;
  lon: string;
  display_name: string;
}

const geocodeAddress = async (address: string): Promise<{ lat: number; lon: number } | null> => {
  try {
    // Nominatim API with user agent
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Subezy-Partner-Connect/1.0'
      }
    });

    if (!response.ok) {
      console.error(`Geocoding failed for ${address}: ${response.status}`);
      return null;
    }

    const data: GeocodeResponse[] = await response.json();
    
    if (data.length === 0) {
      console.log(`No results found for address: ${address}`);
      return null;
    }

    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon)
    };
  } catch (error) {
    console.error(`Error geocoding address ${address}:`, error);
    return null;
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get contacts that need geocoding (no coordinates)
    const { data: contacts, error: fetchError } = await supabaseClient
      .from('contacts')
      .select('id, company_address, operating_cities, latitude, longitude')
      .or('latitude.is.null,longitude.is.null')
      .limit(100); // Increased batch size for faster processing

    if (fetchError) {
      console.error('Error fetching contacts:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch contacts' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No contacts need geocoding', updated: 0 }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing ${contacts.length} contacts for geocoding`);

    let successCount = 0;
    let errorCount = 0;

    for (const contact of contacts) {
      try {
        let coordinates = null;

        // Try geocoding company address first
        if (contact.company_address) {
          coordinates = await geocodeAddress(contact.company_address);
          await delay(800); // Faster processing - 800ms delay
        }

        // If no coordinates from company address, try first operating city
        if (!coordinates && contact.operating_cities && contact.operating_cities.length > 0) {
          const firstCity = contact.operating_cities[0];
          coordinates = await geocodeAddress(firstCity);
          await delay(800);
        }

        // Update contact with coordinates if found
        if (coordinates) {
          const { error: updateError } = await supabaseClient
            .from('contacts')
            .update({
              latitude: coordinates.lat,
              longitude: coordinates.lon,
              geocoded_at: new Date().toISOString()
            })
            .eq('id', contact.id);

          if (updateError) {
            console.error(`Error updating contact ${contact.id}:`, updateError);
            errorCount++;
          } else {
            console.log(`Successfully geocoded contact ${contact.id}`);
            successCount++;
          }
        } else {
          console.log(`Could not geocode contact ${contact.id}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error processing contact ${contact.id}:`, error);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Geocoding completed',
        processed: contacts.length,
        successful: successCount,
        failed: errorCount
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Geocoding function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});