import { TFunction } from 'i18next';

export interface EmailTemplate {
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

export interface EmailTemplateConfig {
  [marketType: string]: {
    [targetMarket: string]: {
      [language: string]: EmailTemplate;
    };
  };
}

// Get language based on target market
export const getLanguageForMarket = (targetMarket: string): string => {
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
    case 'berlin':
    case 'germany':
    case 'austria':
    case 'switzerland':
      return 'de';
    default:
      return 'en';
  }
};

// Email templates for different markets and types
export const emailTemplates: EmailTemplateConfig = {
  van_transport: {
    germany: {
      de: {
        header: "Anfrage Transportpartner",
        subject: "Neue Lieferrouten für große Paketexpressunternehmen",
        greeting: (name) => name ? `Hallo ${name},` : "Hallo,",
        intro: "wir freuen uns, Ihnen eine aufregende Möglichkeit für Lieferrouten bei einem großen Paketexpressunternehmen anzubieten.",
        body: "Unser Van Transport Partner Netzwerk erweitert sich und wir suchen zuverlässige Logistikpartner wie Sie. Als Teil unseres Netzwerks profitieren Sie von:",
        benefits: [
          "Regelmäßigen Aufträgen",
          "Wettbewerbsfähigen Tarifen", 
          "Flexiblen Arbeitszeiten",
          "Professioneller Unterstützung"
        ],
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
        benefits: [
          "Regular orders",
          "Competitive rates",
          "Flexible working hours", 
          "Professional support"
        ],
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
        benefits: [
          "Regelmäßigen Aufträgen in Österreich",
          "Wettbewerbsfähigen österreichischen Tarifen",
          "Flexiblen Arbeitszeiten",
          "Professioneller Unterstützung vor Ort"
        ],
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
        benefits: [
          "Regelmäßigen Aufträgen in der Schweiz",
          "Wettbewerbsfähigen Schweizer Tarifen",
          "Flexiblen Arbeitszeiten",
          "Professioneller Unterstützung"
        ],
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
        benefits: [
          "Regelmäßigen Aufträgen",
          "Wettbewerbsfähigen Tarifen",
          "Flexiblen Arbeitszeiten",
          "Professioneller Unterstützung"
        ],
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
        benefits: [
          "Ordini regolari",
          "Tariffe competitive",
          "Orari di lavoro flessibili",
          "Supporto professionale"
        ],
        action: "Per saperne di più e candidarti, compila il nostro questionario per partner:",
        cta: "Compila il questionario",
        closing: "Non vediamo l'ora di sentirti!",
        signature: "Cordiali saluti,\nJoachim Kalff\nSubezy"
      }
    },
    rome: {
      it: {
        header: "Richiesta Partner di Trasporto",
        subject: "Nuove rotte di consegna in bicicletta per una grande azienda di corrieri espressi",
        greeting: (name) => name ? `Ciao ${name},` : "Ciao,",
        intro: "siamo entusiasti di offrirti un'emozionante opportunità per rotte di consegna presso una grande azienda di spedizioni espresse!",
        body: "La nostra rete di partner per le consegne in bicicletta si sta espandendo a Roma e stiamo cercando partner logistici affidabili come te. Come parte della nostra rete, beneficerai di:",
        benefits: [
          "Ordini regolari",
          "Tariffe competitive",
          "Orari di lavoro flessibili",
          "Supporto professionale"
        ],
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
        benefits: [
          "Commandes régulières",
          "Tarifs compétitifs",
          "Horaires de travail flexibles",
          "Support professionnel"
        ],
        action: "Pour en savoir plus et postuler, veuillez remplir notre questionnaire partenaire:",
        cta: "Remplir le questionnaire",
        closing: "Nous avons hâte de vous entendre!",
        signature: "Cordialement,\nJoachim Kalff\nSubezy"
      }
    },
    barcelona: {
      es: {
        header: "Consulta de Socio de Transporte",
        subject: "Nuevas rutas de entrega en bicicleta para una gran empresa de mensajería express",
        greeting: (name) => name ? `Hola ${name},` : "Hola,",
        intro: "¡estamos emocionados de ofrecerte una oportunidad emocionante para rutas de entrega en una importante empresa de mensajería express!",
        body: "Nuestra red de socios de entrega en bicicleta se está expandiendo a Barcelona y estamos buscando socios logísticos confiables como tú. Como parte de nuestra red, te beneficiarás de:",
        benefits: [
          "Pedidos regulares",
          "Tarifas competitivas",
          "Horarios de trabajo flexibles",
          "Soporte profesional"
        ],
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
        benefits: [
          "Pedidos regulares",
          "Tarifas competitivas",
          "Horarios de trabajo flexibles",
          "Soporte profesional"
        ],
        action: "Para obtener más información y aplicar, completa nuestro cuestionario de socios:",
        cta: "Completar cuestionario",
        closing: "¡Esperamos saber de ti!",
        signature: "Saludos cordiales,\nJoachim Kalff\nSubezy"
      }
    }
  }
};

// Get email template for specific market and type
export const getEmailTemplate = (
  marketType: string,
  targetMarket: string,
  language?: string
): EmailTemplate | null => {
  const lang = language || getLanguageForMarket(targetMarket);
  
  // First try exact match
  const template = emailTemplates[marketType]?.[targetMarket]?.[lang];
  if (template) {
    return template;
  }
  
  // Fallback to first available template for the market type
  const marketTemplates = emailTemplates[marketType];
  if (marketTemplates) {
    for (const market of Object.keys(marketTemplates)) {
      const marketTemplate = marketTemplates[market][lang];
      if (marketTemplate) {
        return marketTemplate;
      }
    }
  }
  
  // Ultimate fallback - default German template
  return emailTemplates.van_transport?.germany?.de || null;
};

// Get available combinations for email sending
export const getAvailableEmailTemplates = () => {
  const combinations: Array<{ marketType: string; targetMarket: string; language: string }> = [];
  
  for (const marketType of Object.keys(emailTemplates)) {
    for (const targetMarket of Object.keys(emailTemplates[marketType])) {
      for (const language of Object.keys(emailTemplates[marketType][targetMarket])) {
        combinations.push({ marketType, targetMarket, language });
      }
    }
  }
  
  return combinations;
};

// Generate form URL for specific market and contact
export const generateFormUrl = (
  baseUrl: string,
  marketType: string,
  targetMarket: string,
  contactId: string
): string => {
  return `${baseUrl}/form/${contactId}?market=${marketType}&region=${targetMarket}`;
};