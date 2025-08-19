import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Create Supabase client with service role for database operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  contacts: Array<{
    id: string;
    company_name: string;
    email_address: string;
    contact_person_first_name?: string;
    contact_person_last_name?: string;
    market_type?: string;
    target_market?: string;
  }>;
  isTest: boolean;
  marketType: string;
  targetMarket: string;
}

interface EmailTemplate {
  header: string;
  subject: string;
  greeting: (name?: string) => string;
  intro: string;
  body: string;
  benefits: string[];
  action: string;
  cta: string;
  closing: string;
  signature: string;
}

// Email templates (synced with src/config/emailTemplates.ts)
const emailTemplates: Record<string, Record<string, Record<string, EmailTemplate>>> = {
  van_transport: {
    germany: {
      de: {
        header: "Anfrage Transportpartner",
        subject: "Neue Lieferrouten für große Paketexpressunternehmen",
        greeting: (name) => name ? `Hallo ${name},` : "Hallo,",
        intro: "wir freuen uns, Ihnen eine aufregende Möglichkeit für Lieferrouten bei einem großen Paketexpressunternehmen anzubieten.",
        body: "Unser Van Transport Partner Netzwerk erweitert sich und wir suchen zuverlässige Logistikpartner wie Sie. Als Teil unseres Netzwerks profitieren Sie von:",
        benefits: ["Regelmäßigen Aufträgen", "Wettbewerbsfähigen Tarifen", "Flexiblen Arbeitszeiten", "Professioneller Unterstützung"],
        action: "Um mehr zu erfahren und sich zu bewerben, füllen Sie bitte unseren Partner-Fragebogen aus:",
        cta: "Fragebogen ausfüllen",
        closing: "Wir freuen uns darauf, von Ihnen zu hören!",
        signature: "Mit freundlichen Grüßen,\nJoachim Kalff\nSubezy"
      }
    },
    uk: {
      en: {
        header: "Transport Partner Inquiry",
        subject: "New delivery routes for major parcel express company",
        greeting: (name) => name ? `Hello ${name},` : "Hello,",
        intro: "we are excited to offer you an exciting opportunity for delivery routes at a major parcel express company.",
        body: "Our Van Transport Partner Network is expanding and we are looking for reliable logistics partners like you. As part of our network, you will benefit from:",
        benefits: ["Regular orders", "Competitive rates", "Flexible working hours", "Professional support"],
        action: "To learn more and apply, please fill out our partner questionnaire:",
        cta: "Fill out questionnaire",
        closing: "We look forward to hearing from you!",
        signature: "Best regards,\nJoachim Kalff\nSubezy"
      }
    },
    ireland: {
      en: {
        header: "Transport Partner Inquiry",
        subject: "New delivery routes for major parcel express company",
        greeting: (name) => name ? `Hello ${name},` : "Hello,",
        intro: "we are excited to offer you an exciting opportunity for delivery routes at a major parcel express company.",
        body: "Our Van Transport Partner Network is expanding to Ireland and we are looking for reliable logistics partners like you. As part of our network, you will benefit from:",
        benefits: ["Regular orders", "Competitive rates", "Flexible working hours", "Professional support"],
        action: "To learn more and apply, please fill out our partner questionnaire:",
        cta: "Fill out questionnaire",
        closing: "We look forward to hearing from you!",
        signature: "Best regards,\nJoachim Kalff\nSubezy"
      }
    },
    austria: {
      de: {
        header: "Anfrage Transportpartner",
        subject: "Neue Lieferrouten für große Paketexpressunternehmen",
        greeting: (name) => name ? `Hallo ${name},` : "Hallo,",
        intro: "wir freuen uns, Ihnen eine aufregende Möglichkeit für Lieferrouten bei einem großen Paketexpressunternehmen in Österreich anzubieten!",
        body: "Unser Van Transport Partner Netzwerk expandiert nach Österreich und wir suchen zuverlässige Logistikpartner wie Sie. Als Teil unseres Netzwerks profitieren Sie von:",
        benefits: ["Regelmäßigen Aufträgen in Österreich", "Wettbewerbsfähigen österreichischen Tarifen", "Flexiblen Arbeitszeiten", "Professioneller Unterstützung vor Ort"],
        action: "Um mehr zu erfahren und sich zu bewerben, füllen Sie bitte unseren Partner-Fragebogen aus:",
        cta: "Fragebogen ausfüllen",
        closing: "Wir freuen uns darauf, von Ihnen zu hören!",
        signature: "Mit freundlichen Grüßen,\nJoachim Kalff\nSubezy"
      }
    },
    switzerland: {
      de: {
        header: "Anfrage Transportpartner",
        subject: "Neue Lieferrouten für große Paketexpressunternehmen",
        greeting: (name) => name ? `Grüezi ${name},` : "Grüezi,",
        intro: "wir freuen uns, Ihnen eine aufregende Möglichkeit für Lieferrouten bei einem großen Paketexpressunternehmen in der Schweiz anzubieten!",
        body: "Unser Van Transport Partner Netzwerk erweitert sich in die Schweiz und wir suchen zuverlässige Logistikpartner wie Sie. Als Teil unseres Netzwerks profitieren Sie von:",
        benefits: ["Regelmäßigen Aufträgen in der Schweiz", "Wettbewerbsfähigen Schweizer Tarifen", "Flexiblen Arbeitszeiten", "Professioneller Unterstützung"],
        action: "Um mehr zu erfahren und sich zu bewerben, füllen Sie bitte unseren Partner-Fragebogen aus:",
        cta: "Fragebogen ausfüllen",
        closing: "Wir freuen uns darauf, von Ihnen zu hören!",
        signature: "Mit freundlichen Grüssen,\nJoachim Kalff\nSubezy"
      }
    }
  },
  bicycle_delivery: {
    berlin: {
      de: {
        header: "Anfrage Transportpartner",
        subject: "Neue Fahrrad-Lieferrouten für ein großes Paketexpressunternehmen",
        greeting: (name) => name ? `Hallo ${name},` : "Hallo,",
        intro: "wir freuen uns, Ihnen eine aufregende Möglichkeit für Lieferrouten bei einem großen Paketexpressunternehmen anzubieten.",
        body: "Unser Fahrrad-Lieferungs Partner Netzwerk erweitert sich in Berlin und wir suchen zuverlässige Logistikpartner wie Sie. Als Teil unseres Netzwerks profitieren Sie von:",
        benefits: ["Regelmäßigen Aufträgen", "Wettbewerbsfähigen Tarifen", "Flexiblen Arbeitszeiten", "Professioneller Unterstützung"],
        action: "Um mehr zu erfahren und sich zu bewerben, füllen Sie bitte unseren Partner-Fragebogen aus:",
        cta: "Fragebogen ausfüllen",
        closing: "Wir freuen uns darauf, von Ihnen zu hören!",
        signature: "Mit freundlichen Grüßen,\nJoachim Kalff\nSubezy"
      }
    },
    milan: {
      it: {
        header: "Richiesta Partner di Trasporto",
        subject: "Nuove rotte di consegna in bicicletta per una grande azienda di corrieri espressi",
        greeting: (name) => name ? `Ciao ${name},` : "Ciao,",
        intro: "siamo entusiasti di offrirti un'emozionante opportunità per rotte di consegna presso una grande azienda di spedizioni espresse!",
        body: "La nostra rete di partner per le consegne in bicicletta si sta espandendo a Milano e stiamo cercando partner logistici affidabili come te. Come parte della nostra rete, beneficerai di:",
        benefits: ["Ordini regolari", "Tariffe competitive", "Orari di lavoro flessibili", "Supporto professionale"],
        action: "Per saperne di più e candidarti, compila il nostro questionario per partner:",
        cta: "Compila il questionario",
        closing: "Non vediamo l'ora di sentirti!",
        signature: "Cordiali saluti,\nJoachim Kalff\nSubezy"
      }
    },
    paris: {
      fr: {
        header: "Demande de Partenaire de Transport",
        subject: "Nouvelles routes de livraison à vélo pour une grande entreprise de messagerie express",
        greeting: (name) => name ? `Bonjour ${name},` : "Bonjour,",
        intro: "nous sommes ravis de vous offrir une opportunité passionnante pour des routes de livraison dans une grande entreprise de messagerie express!",
        body: "Notre réseau de partenaires de livraison à vélo s'étend à Paris et nous recherchons des partenaires logistiques fiables comme vous. En tant que membre de notre réseau, vous bénéficierez de:",
        benefits: ["Commandes régulières", "Tarifs compétitifs", "Horaires de travail flexibles", "Support professionnel"],
        action: "Pour en savoir plus et postuler, veuillez remplir notre questionnaire partenaire:",
        cta: "Remplir le questionnaire",
        closing: "Nous avons hâte de vous entendre!",
        signature: "Cordialement,\nJoachim Kalff\nSubezy"
      }
    },
    rome: {
      it: {
        header: "Richiesta Partner di Trasporto",
        subject: "Nuove rotte di consegna in bicicletta per una grande azienda di corrieri espressi",
        greeting: (name) => name ? `Ciao ${name},` : "Ciao,",
        intro: "siamo entusiasti di offrirti un'emozionante opportunità per rotte di consegna presso una grande azienda di spedizioni espresse!",
        body: "La nostra rete di partner per le consegne in bicicletta si sta espandendo a Roma e stiamo cercando partner logistici affidabili come te. Come parte della nostra rete, beneficerai di:",
        benefits: ["Ordini regolari", "Tariffe competitive", "Orari di lavoro flessibili", "Supporto professionale"],
        action: "Per saperne di più e candidarti, compila il nostro questionario per partner:",
        cta: "Compila il questionario",
        closing: "Non vediamo l'ora di sentirti!",
        signature: "Cordiali saluti,\nJoachim Kalff\nSubezy"
      }
    },
    barcelona: {
      es: {
        header: "Consulta de Socio de Transporte",
        subject: "Nuevas rutas de entrega en bicicleta para una gran empresa de mensajería express",
        greeting: (name) => name ? `Hola ${name},` : "Hola,",
        intro: "¡estamos emocionados de ofrecerte una oportunidad emocionante para rutas de entrega en una importante empresa de mensajería express!",
        body: "Nuestra red de socios de entrega en bicicleta se está expandiendo a Barcelona y estamos buscando socios logísticos confiables como tú. Como parte de nuestra red, te beneficiarás de:",
        benefits: ["Pedidos regulares", "Tarifas competitivas", "Horarios de trabajo flexibles", "Soporte profesional"],
        action: "Para obtener más información y aplicar, completa nuestro cuestionario de socios:",
        cta: "Completar cuestionario",
        closing: "¡Esperamos saber de ti!",
        signature: "Saludos cordiales,\nJoachim Kalff\nSubezy"
      }
    },
    madrid: {
      es: {
        header: "Consulta de Socio de Transporte",
        subject: "Nuevas rutas de entrega en bicicleta para una gran empresa de mensajería express",
        greeting: (name) => name ? `Hola ${name},` : "Hola,",
        intro: "¡estamos emocionados de ofrecerte una oportunidad emocionante para rutas de entrega en una importante empresa de mensajería express!",
        body: "Nuestra red de socios de entrega en bicicleta se está expandiendo a Madrid y estamos buscando socios logísticos confiables como tú. Como parte de nuestra red, te beneficiarás de:",
        benefits: ["Pedidos regulares", "Tarifas competitivas", "Horarios de trabajo flexibles", "Soporte profesional"],
        action: "Para obtener más información y aplicar, completa nuestro cuestionario de socios:",
        cta: "Completar cuestionario",
        closing: "¡Esperamos saber de ti!",
        signature: "Saludos cordiales,\nJoachim Kalff\nSubezy"
      }
    }
  }
};

// Get language based on target market
const getLanguageForMarket = (targetMarket: string): string => {
  switch (targetMarket) {
    case 'uk':
    case 'ireland':
      return 'en';
    case 'paris':
      return 'fr';
    case 'milan':
    case 'rome':
      return 'it';
    case 'barcelona':
    case 'madrid':
      return 'es';
    case 'austria':
    case 'switzerland':
    case 'germany':
    case 'berlin':
      return 'de';
    default:
      return 'de';
  }
};

// Get email template for specific market and type
const getEmailTemplate = (marketType: string, targetMarket: string): EmailTemplate => {
  const language = getLanguageForMarket(targetMarket);
  
  // Try exact match first
  const template = emailTemplates[marketType]?.[targetMarket]?.[language];
  if (template) return template;
  
  // Try fallback within same market type with different language
  const marketTypeTemplates = emailTemplates[marketType];
  if (marketTypeTemplates) {
    for (const market of Object.keys(marketTypeTemplates)) {
      const marketTemplate = marketTypeTemplates[market]?.[language];
      if (marketTemplate) return marketTemplate;
    }
    
    // If no language match, try first available market in this type
    const firstMarket = Object.keys(marketTypeTemplates)[0];
    const firstLanguage = Object.keys(marketTypeTemplates[firstMarket])[0];
    const firstTemplate = marketTypeTemplates[firstMarket]?.[firstLanguage];
    if (firstTemplate) return firstTemplate;
  }
  
  // Final fallback to default German template
  return emailTemplates.van_transport.germany.de;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contacts, isTest, marketType, targetMarket }: ContactEmailRequest = await req.json();

    // Use fixed subezy.snipe-solutions.de domain for all form links
    const baseUrl = "https://subezy.snipe-solutions.de";
    const results = [];
    
    // Get email template for the selected market
    const template = getEmailTemplate(marketType, targetMarket);
    
    for (const contact of contacts) {
      // Generate market-specific form URL
      const formUrl = `${baseUrl}/form/${contact.id}?market=${marketType}&region=${targetMarket}`;
      
      // Generate personalized content
      const contactName = contact.contact_person_first_name && contact.contact_person_last_name 
        ? `${contact.contact_person_first_name} ${contact.contact_person_last_name}`
        : contact.contact_person_first_name || '';
      
      const benefits = template.benefits.map(benefit => 
        `<li style="margin-bottom: 8px;">${benefit}</li>`
      ).join('');
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">${template.header}</h1>
          </div>
          
          <div style="padding: 40px 30px; background: #f9fafb;">
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              ${template.greeting(contactName)}
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              ${template.intro}
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              ${template.body}
            </p>
            
            <ul style="margin: 30px 0; padding-left: 20px;">
              ${benefits}
            </ul>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 35px;">
              ${template.action}
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${formUrl}" style="display: inline-block; background-color: #FF9900; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                ${template.cta}
              </a>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 40px;">
              ${template.closing}
            </p>
            
            <div style="font-size: 16px; line-height: 1.6; white-space: pre-line;">
              ${template.signature}
            </div>
          </div>
          
          <div style="background: #e5e7eb; padding: 10px; text-align: center;">
            &nbsp;
          </div>
        </div>
      `;

      try {
        // Send email with Resend
        const emailResponse = await resend.emails.send({
          from: "Joachim Kalff <joachim@subezy.de>",
          to: [contact.email_address],
          subject: isTest ? `[TEST] ${template.subject}` : template.subject,
          html: emailHtml,
          tags: [
            { name: 'contact_id', value: contact.id },
            { name: 'is_test', value: isTest.toString() },
            { name: 'market_type', value: marketType },
            { name: 'target_market', value: targetMarket }
          ],
          // Enable tracking
          headers: {
            'X-Entity-Ref-ID': contact.id
          }
        });

        if (emailResponse.data) {
          console.log(`Email sent successfully to ${contact.email_address}, ID: ${emailResponse.data.id}`);
          
          // Save email ID to contact and update email_sent flag
          await supabase
            .from('contacts')
            .update({ 
              resend_email_id: emailResponse.data.id,
              email_sent: true,
              email_sent_at: new Date().toISOString()
            })
            .eq('id', contact.id);

          // Create initial tracking record
          await supabase
            .from('email_tracking')
            .insert({
              contact_id: contact.id,
              email_id: emailResponse.data.id,
              event_type: 'sent',
              event_data: {
                to: contact.email_address,
                subject: isTest ? `[TEST] ${template.subject}` : template.subject,
                is_test: isTest,
                market_type: marketType,
                target_market: targetMarket
              }
            });

          results.push({
            contact_id: contact.id,
            email_id: emailResponse.data.id,
            status: 'sent',
            email: contact.email_address
          });
        } else {
          throw new Error('Failed to send email - no response data');
        }
      } catch (emailError: any) {
        console.error(`Failed to send email to ${contact.email_address}:`, emailError);
        results.push({
          contact_id: contact.id,
          status: 'error',
          email: contact.email_address,
          error: emailError.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${results.filter(r => r.status === 'sent').length} emails sent successfully`,
        results
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending emails:", error);
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