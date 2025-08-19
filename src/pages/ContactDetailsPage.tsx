import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EmailTracking } from "@/components/EmailTracking";
import { EditContact } from "@/components/EditContact";
import { ContactComments } from "@/components/ContactComments";
import { generateFormUrl } from "@/config/emailTemplates";
import { ContactDetailsVanTransport } from "@/components/ContactDetailsVanTransport";
import { ContactDetailsBicycleDelivery } from "@/components/ContactDetailsBicycleDelivery";
import { 
  Mail, Phone, Globe, Building, User, CheckCircle, XCircle, 
  MapPin, Calendar, Truck, Users2, Package, Shield, Star,
  Building2, FileText, Clock, Award, ExternalLink, Copy,
  ArrowLeft, Eye, Send, Edit, Trash2, MessageSquare, Download, FileDown, Bike, Target
} from "lucide-react";
import jsPDF from 'jspdf';

interface Contact {
  id: string;
  company_name: string;
  email_address: string;
  company_address?: string;
  legal_form?: string;
  website?: string;
  contact_person_first_name?: string;
  contact_person_last_name?: string;
  contact_person_position?: string;
  phone_number?: string;
  email_sent: boolean;
  form_completed: boolean;
  created_at: string;
  email_sent_at?: string;
  form_completed_at?: string;
  market_type?: string;
  target_market?: string;
  // Van Transport fields
  full_time_drivers?: number;
  transporter_count?: number;
  vehicle_types?: string[];
  // Bicycle Delivery fields
  delivery_driver_count?: number;
  bicycle_driver_count?: number;
  bicycle_count?: number;
  cargo_bike_count?: number;
  uses_cargo_bikes?: boolean;
  company_owns_vehicles?: boolean;
  employee_type?: string;
  employment_status?: string;
  works_for_quick_commerce?: boolean;
  works_for_gig_economy_food?: boolean;
  quick_commerce_companies?: string[];
  gig_economy_companies?: string[];
  // Common fields
  is_last_mile_logistics?: boolean;
  last_mile_since_when?: string;
  operating_cities?: string[];
  food_delivery_services?: boolean;
  food_delivery_platforms?: string[];
  staff_types?: string[];
  total_vehicle_count?: number;
  amazon_experience?: boolean;
  amazon_work_capacity?: string;
  city_availability?: any;
  additional_comments?: string;
  operates_multiple_countries?: boolean;
  operates_multiple_cities?: boolean;
}

const ContactDetailsPage = () => {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation(['contacts', 'forms', 'common']);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  useEffect(() => {
    const fetchContact = async () => {
      if (!contactId) return;
      
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', contactId)
          .single();

        if (error) {
          toast({
            title: t('common:messages.error'),
            description: t('contacts:details.title') + ' ' + t('common:messages.error'),
            variant: "destructive",
          });
          navigate('/dashboard');
          return;
        }

        setContact(data);
      } catch (error) {
        console.error('Error fetching contact:', error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [contactId, navigate, toast]);

  const handleDeleteContact = async () => {
    if (!contact) return;
    
    if (!confirm(t('common:messages.confirmDelete'))) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contact.id);

      if (error) {
        throw error;
      }

      toast({
        title: t('common:messages.success'),
        description: t('contacts:details.deleteButton'),
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: t('common:messages.error'),
        description: error.message || t('contacts:details.deleteButton'),
        variant: "destructive",
      });
    }
  };

  const refreshContact = async () => {
    if (!contactId) return;
    
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .single();

      if (!error && data) {
        setContact(data);
      }
    } catch (error) {
      console.error('Error refreshing contact:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('common:messages.loading')}</p>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">{t('contacts:details.title')} {t('common:messages.noData')}</h2>
            <p className="text-muted-foreground mb-4">{t('contacts:details.title')} {t('common:messages.noData')}</p>
            <Button onClick={() => navigate('/dashboard')}>
              {t('common:buttons.back')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper functions
  const getCompletionPercentage = () => {
    // Basis-Felder (9 Felder)
    const basicFields = [
      contact.company_name,
      contact.email_address,
      contact.company_address,
      contact.legal_form,
      contact.website,
      contact.contact_person_first_name,
      contact.contact_person_last_name,
      contact.contact_person_position,
      contact.phone_number
    ];

    // Fragebogen-Felder (12 Felder)
    const questionnaireFields = [
      contact.is_last_mile_logistics !== null && contact.is_last_mile_logistics !== undefined,
      contact.last_mile_since_when,
      contact.operating_cities && contact.operating_cities.length > 0,
      contact.food_delivery_services !== null && contact.food_delivery_services !== undefined,
      contact.food_delivery_platforms && contact.food_delivery_platforms.length > 0,
      contact.staff_types && contact.staff_types.length > 0,
      contact.delivery_driver_count !== null && contact.delivery_driver_count !== undefined,
      contact.vehicle_types && contact.vehicle_types.length > 0,
      contact.total_vehicle_count !== null && contact.total_vehicle_count !== undefined,
      contact.amazon_experience !== null && contact.amazon_experience !== undefined,
      contact.city_availability && Object.keys(contact.city_availability).length > 0,
      contact.additional_comments // Optional field - counts as bonus
    ];

    // Zähle ausgefüllte Basis-Felder
    const completedBasic = basicFields.filter(field => field && String(field).trim() !== '').length;
    
    // Zähle ausgefüllte Fragebogen-Felder
    const completedQuestionnaire = questionnaireFields.filter(field => {
      if (typeof field === 'boolean') return field;
      if (typeof field === 'string') return field && field.trim() !== '';
      if (typeof field === 'number') return field >= 0;
      return !!field;
    }).length;

    // Berechne Gesamtprozent (21 Felder insgesamt: 9 Basis + 12 Fragebogen)
    const totalFields = basicFields.length + (questionnaireFields.length - 1); // -1 weil Kommentar optional ist
    const totalCompleted = completedBasic + completedQuestionnaire;
    
    return Math.round((totalCompleted / totalFields) * 100);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: t('details.copied', { item: label }),
        description: t('details.copied', { item: label }),
      });
    } catch (err) {
      toast({
        title: t('common:messages.error'),
        description: t('details.copyError'),
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = () => {
    if (contact.form_completed) return 'bg-green-500';
    if (contact.email_sent) return 'bg-amazon-orange';
    return 'bg-muted';
  };

  const getStatusText = () => {
    if (contact.form_completed) return t('details.completed');
    if (contact.email_sent) return t('list.status.emailSent');
    return t('details.created');
  };

  // Determine if it's bicycle delivery market type
  const isBicycleDelivery = contact.market_type === 'bicycle_delivery';

  const generatePDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      
      // Set colors matching the platform design
      const primaryBlue = '#232F3E';
      const primaryOrange = '#FF9900';
      const textGray = '#555';
      
      let currentY = 20;
      let currentPage = 1;
      
      // Helper function to check if we need a new page
      const checkPageSpace = (requiredSpace: number) => {
        if (currentY + requiredSpace > pageHeight - 30) {
          pdf.addPage();
          currentPage++;
          currentY = 30;
          return true;
        }
        return false;
      };
      
      // Helper function to format boolean values
      const formatBoolean = (value: boolean | null | undefined) => {
        if (value === null || value === undefined) return 'Keine Angabe';
        return value ? '✓ Ja' : '✗ Nein';
      };
      
      // Helper function to format arrays
      const formatArray = (arr: string[] | undefined | null, fallback = 'Keine Angaben') => {
        if (!arr || !Array.isArray(arr) || arr.length === 0) return fallback;
        return arr.join(', ');
      };

      // ============= PAGE 1: HEADER & COMPANY OVERVIEW =============
      
      // Header with company branding
      pdf.setFillColor(35, 47, 62);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      // Company name
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(contact.company_name, margin, 20);
      
      // Market type and target market info
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const marketInfo = `${contact.market_type || 'van_transport'} | ${contact.target_market || 'germany'}`.toUpperCase();
      pdf.text(marketInfo, pageWidth - 80, 15);
      
      // Status and date
      const statusText = getStatusText();
      pdf.text(`Status: ${statusText}`, pageWidth - 80, 25);
      
      currentY = 50;
      
      // Quick Stats Row
      pdf.setTextColor(85, 85, 85);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Profil-Übersicht', margin, currentY);
      
      currentY += 15;
      const completionPercentage = getCompletionPercentage();
      const daysOld = Math.ceil((Date.now() - new Date(contact.created_at).getTime()) / (1000 * 60 * 60 * 24));
      
      // Stats in columns
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      // Column 1: Completion
      pdf.setFont('helvetica', 'bold');
      pdf.text('Vollständigkeit:', margin, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(255, 153, 0);
      pdf.text(`${completionPercentage}%`, margin + 45, currentY);
      
      // Column 2: Days since creation
      pdf.setTextColor(85, 85, 85);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Erstellt vor:', margin + 90, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${daysOld} Tagen`, margin + 135, currentY);
      
      currentY += 15;
      
      // Market & Target Information Section
      checkPageSpace(40);
      pdf.setTextColor(35, 47, 62);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Market & Zielmarkt Information', margin, currentY);
      
      currentY += 15;
      pdf.setTextColor(85, 85, 85);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const marketData = [
        ['Markttyp:', contact.market_type || 'van_transport'],
        ['Zielmarkt:', contact.target_market || 'germany'],
        ['Beschäftigungsstatus:', (contact as any).employment_status || 'Keine Angabe'],
        ['Mitarbeitertyp:', (contact as any).employee_type || 'Keine Angabe']
      ];
      
      marketData.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, margin, currentY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, margin + 50, currentY);
        currentY += 8;
      });
      
      currentY += 10;
      
      // Company Information Section
      checkPageSpace(60);
      pdf.setTextColor(35, 47, 62);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Firmendaten', margin, currentY);
      
      currentY += 15;
      pdf.setTextColor(85, 85, 85);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const companyInfo = [
        ['Firmenname:', contact.company_name],
        ['E-Mail:', contact.email_address],
        ['Telefon:', contact.phone_number || 'Keine Angabe'],
        ['Adresse:', contact.company_address || 'Keine Angabe'],
        ['Rechtsform:', contact.legal_form || 'Keine Angabe'],
        ['Website:', contact.website || 'Keine Angabe'],
        ['Gründungsjahr:', (contact as any).company_established_year?.toString() || 'Keine Angabe'],
        ['Eigene Fahrzeuge:', formatBoolean((contact as any).company_owns_vehicles)]
      ];
      
      companyInfo.forEach(([label, value]) => {
        checkPageSpace(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, margin, currentY);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(value, maxWidth - 60);
        pdf.text(lines, margin + 60, currentY);
        currentY += Math.max(8, lines.length * 6);
      });
      
      currentY += 10;
      
      // Contact Person Section
      const contactPersonName = [contact.contact_person_first_name, contact.contact_person_last_name]
        .filter(Boolean).join(' ');
      
      if (contactPersonName || contact.contact_person_position) {
        checkPageSpace(40);
        pdf.setTextColor(35, 47, 62);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Ansprechpartner', margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const contactInfo = [
          ['Name:', contactPersonName || 'Keine Angabe'],
          ['Position:', contact.contact_person_position || 'Keine Angabe']
        ];
        
        contactInfo.forEach(([label, value]) => {
          pdf.setFont('helvetica', 'bold');
          pdf.text(label, margin, currentY);
          pdf.setFont('helvetica', 'normal');
          pdf.text(value, margin + 60, currentY);
          currentY += 8;
        });
        
        currentY += 10;
      }

      // ============= PAGE 2: DETAILED LOGISTICS & PERSONNEL =============
      
      pdf.addPage();
      currentPage++;
      currentY = 30;
      
      // Page header
      pdf.setTextColor(35, 47, 62);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Logistik & Personal Details', margin, currentY);
      
      currentY += 20;
      
      // Last-Mile Logistics Section
      pdf.setTextColor(35, 47, 62);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Last-Mile Logistik', margin, currentY);
      
      currentY += 15;
      pdf.setTextColor(85, 85, 85);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const logisticsInfo = [
        ['Last-Mile-Logistik:', formatBoolean(contact.is_last_mile_logistics)],
        ['Seit wann:', contact.last_mile_since_when || 'Keine Angabe'],
        ['Operates Last-Mile:', formatBoolean((contact as any).operates_last_mile_logistics)],
        ['Food Delivery Services:', formatBoolean(contact.food_delivery_services)],
        ['Amazon Erfahrung:', formatBoolean(contact.amazon_experience)],
        ['Amazon Arbeitskapazität:', (contact as any).amazon_work_capacity || 'Keine Angabe'],
        ['Quick Commerce:', formatBoolean((contact as any).works_for_quick_commerce)],
        ['Gig Economy Food:', formatBoolean((contact as any).works_for_gig_economy_food)]
      ];
      
      logisticsInfo.forEach(([label, value]) => {
        checkPageSpace(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, margin, currentY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, margin + 70, currentY);
        currentY += 8;
      });
      
      currentY += 15;
      
      // Personnel Structure Section (Market-specific)
      checkPageSpace(40);
      pdf.setTextColor(35, 47, 62);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(isBicycleDelivery ? 'Personal & Beschäftigung' : 'Personal-Struktur', margin, currentY);
      
      currentY += 15;
      pdf.setTextColor(85, 85, 85);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const personnelInfo = isBicycleDelivery ? [
        ['Lieferfahrer:', contact.delivery_driver_count?.toString() || 'Keine Angabe'],
        ['Fahrradfahrer:', (contact as any).bicycle_driver_count?.toString() || 'Keine Angabe'],
        ['Beschäftigungsstatus:', (contact as any).employment_status || 'Keine Angabe'],
        ['Mitarbeitertyp:', (contact as any).employee_type || 'Keine Angabe'],
        ['Personal-Typen:', formatArray(contact.staff_types)]
      ] : [
        ['Vollzeit-Fahrer:', (contact as any).full_time_drivers?.toString() || 'Keine Angabe'],
        ['Transporter-Anzahl:', (contact as any).transporter_count?.toString() || 'Keine Angabe'],
        ['Personal-Typen:', formatArray(contact.staff_types)]
      ];
      
      personnelInfo.forEach(([label, value]) => {
        checkPageSpace(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, margin, currentY);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(value, maxWidth - 70);
        pdf.text(lines, margin + 70, currentY);
        currentY += Math.max(8, lines.length * 6);
      });
      
      currentY += 15;
      
      // Vehicle Information Section (Market-specific)
      checkPageSpace(60);
      pdf.setTextColor(35, 47, 62);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Fahrzeuge & Ausrüstung', margin, currentY);
      
      currentY += 15;
      pdf.setTextColor(85, 85, 85);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const vehicleInfo = isBicycleDelivery ? [
        ['Fahrräder:', (contact as any).bicycle_count?.toString() || 'Keine Angabe'],
        ['Cargo Bikes:', (contact as any).cargo_bike_count?.toString() || 'Keine Angabe'],
        ['Nutzt Cargo Bikes:', formatBoolean((contact as any).uses_cargo_bikes)],
        ['Eigene Fahrzeuge:', formatBoolean((contact as any).company_owns_vehicles)],
        ['Gesamtfahrzeuge:', (contact as any).total_vehicle_count?.toString() || 'Keine Angabe']
      ] : [
        ['Fahrzeug-Typen:', formatArray(contact.vehicle_types)],
        ['Gesamtfahrzeuge:', (contact as any).total_vehicle_count?.toString() || 'Keine Angabe']
      ];
      
      vehicleInfo.forEach(([label, value]) => {
        checkPageSpace(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, margin, currentY);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(value, maxWidth - 70);
        pdf.text(lines, margin + 70, currentY);
        currentY += Math.max(8, lines.length * 6);
      });
      
      currentY += 15;
      
      // Operational Scope Section
      checkPageSpace(40);
      pdf.setTextColor(35, 47, 62);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Operativer Bereich', margin, currentY);
      
      currentY += 15;
      pdf.setTextColor(85, 85, 85);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const operationalInfo = [
        ['Mehrere Länder:', formatBoolean((contact as any).operates_multiple_countries)],
        ['Mehrere Städte:', formatBoolean((contact as any).operates_multiple_cities)]
      ];
      
      operationalInfo.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, margin, currentY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, margin + 70, currentY);
        currentY += 8;
      });

      // ============= PAGE 3: PLATFORMS, CITIES & TIMELINE =============
      
      pdf.addPage();
      currentPage++;
      currentY = 30;
      
      // Page header
      pdf.setTextColor(35, 47, 62);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Plattformen, Städte & Timeline', margin, currentY);
      
      currentY += 20;
      
      // Platform Experience Section (Market-specific)
      pdf.setTextColor(35, 47, 62);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(isBicycleDelivery ? 'Plattform-Erfahrung' : 'Plattform & Amazon Erfahrung', margin, currentY);
      
      currentY += 15;
      pdf.setTextColor(85, 85, 85);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const platformData = isBicycleDelivery ? [
        ['Quick Commerce:', formatBoolean((contact as any).works_for_quick_commerce)],
        ['Gig Economy Food:', formatBoolean((contact as any).works_for_gig_economy_food)],
        ['Quick Commerce Plattformen:', formatArray((contact as any).quick_commerce_companies)],
        ['Gig Economy Plattformen:', formatArray((contact as any).gig_economy_companies)]
      ] : [
        ['Food Delivery Services:', formatBoolean(contact.food_delivery_services)],
        ['Food Delivery Platforms:', formatArray((contact as any).food_delivery_platforms)],
        ['Amazon Erfahrung:', formatBoolean(contact.amazon_experience)],
        ['Amazon Arbeitskapazität:', (contact as any).amazon_work_capacity || 'Keine Angabe']
      ];
      
      platformData.forEach(([label, value]) => {
        checkPageSpace(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, margin, currentY);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(value, maxWidth - 80);
        pdf.text(lines, margin + 80, currentY);
        currentY += Math.max(8, lines.length * 6);
      });
      
      currentY += 15;
      
      // Operating Cities Section
      if (contact.operating_cities && contact.operating_cities.length > 0) {
        checkPageSpace(30);
        pdf.setTextColor(35, 47, 62);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Aktive Städte', margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Operating Cities:', margin, currentY);
        pdf.setFont('helvetica', 'normal');
        const cities = contact.operating_cities.join(', ');
        const cityLines = pdf.splitTextToSize(cities, maxWidth - 80);
        pdf.text(cityLines, margin + 80, currentY);
        currentY += Math.max(8, cityLines.length * 6) + 10;
      }
      
      // Available Cities/Zones Section
      if (contact.city_availability && Object.keys(contact.city_availability).length > 0) {
        checkPageSpace(30);
        pdf.setTextColor(35, 47, 62);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Verfügbare Gebiete', margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const availableCities = Object.entries(contact.city_availability)
          .filter(([_, available]) => available === true)
          .map(([city, _]) => city)
          .join(', ');
          
        if (availableCities) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Verfügbare Bereiche:', margin, currentY);
          pdf.setFont('helvetica', 'normal');
          const availableLines = pdf.splitTextToSize(availableCities, maxWidth - 80);
          pdf.text(availableLines, margin + 80, currentY);
          currentY += Math.max(8, availableLines.length * 6) + 10;
        }
      }
      
      // Timeline Section
      checkPageSpace(50);
      pdf.setTextColor(35, 47, 62);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Timeline', margin, currentY);
      
      currentY += 15;
      pdf.setTextColor(85, 85, 85);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const timelineData = [
        ['Erstellt:', formatDate(contact.created_at)],
        ['Aktualisiert:', formatDate((contact as any).updated_at)],
        ['Email gesendet:', contact.email_sent_at ? formatDate(contact.email_sent_at) : 'Nicht gesendet'],
        ['Formular ausgefüllt:', contact.form_completed_at ? formatDate(contact.form_completed_at) : 'Nicht ausgefüllt']
      ];
      
      timelineData.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, margin, currentY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, margin + 80, currentY);
        currentY += 8;
      });
      
      currentY += 15;
      
      // Comments Section
      if (contact.additional_comments) {
        checkPageSpace(30);
        pdf.setTextColor(35, 47, 62);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Zusätzliche Kommentare', margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const commentLines = pdf.splitTextToSize(contact.additional_comments, maxWidth);
        pdf.text(commentLines, margin, currentY);
        currentY += commentLines.length * 6;
      }
      
      // Footer on all pages
      for (let i = 1; i <= currentPage; i++) {
        if (i > 1) pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`${t('details.generated')} ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}`, margin, pageHeight - 20);
        pdf.text(`Seite ${i} von ${currentPage} | ${t('details.pdfFooter')}`, pageWidth - 120, pageHeight - 20);
      }
      
      // Save PDF
      const fileName = `kontakt_${contact.company_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: t('details.pdfCreated'),
        description: t('details.pdfDownloaded', { fileName }),
      });
      
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: t('common:messages.error'),
        description: t('details.pdfError'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{t('common:buttons.back')}</span>
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-amazon-blue">{t('details.title')}</h1>
                <p className="text-sm text-muted-foreground truncate">{contact.company_name}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={generatePDF}
                className="flex items-center gap-2 flex-1 sm:flex-none bg-amazon-orange/10 border-amazon-orange/30 text-amazon-orange hover:bg-amazon-orange/20"
              >
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline">{t('details.downloadPdf')}</span>
                <span className="sm:hidden">PDF</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/form/${contact.id}`, '_blank')}
                className="flex items-center gap-2 flex-1 sm:flex-none"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">{t('list.actions.openForm')}</span>
                <span className="sm:hidden">{t('list.actions.form')}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingContact(contact)}
                className="flex items-center gap-2 flex-1 sm:flex-none"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">{t('common:buttons.edit')}</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteContact}
                className="flex items-center gap-2 flex-1 sm:flex-none"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">{t('common:buttons.delete')}</span>
              </Button>
              {contact.email_sent && !contact.form_completed && (
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-amazon-orange hover:bg-amazon-orange/90 flex-1 sm:flex-none"
                >
                  <Send className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{t('details.resendEmail')}</span>
                  <span className="sm:hidden">{t('common:buttons.submit')}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header with Company Info */}
        <div className="bg-gradient-to-r from-amazon-blue to-amazon-blue/80 text-white rounded-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16 bg-white/20 shrink-0">
                <AvatarFallback className="text-lg sm:text-2xl font-bold text-amazon-blue bg-white">
                  {contact.company_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold mb-2 break-words">{contact.company_name}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-white/80 mb-2">
                  <div className="flex items-center gap-1 min-w-0">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{contact.email_address}</span>
                  </div>
                  {contact.phone_number && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{contact.phone_number}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {isBicycleDelivery ? <Bike className="h-3 w-3 mr-1" /> : <Truck className="h-3 w-3 mr-1" />}
                    {isBicycleDelivery ? 'Bicycle Delivery' : 'Van Transport'}
                  </Badge>
                  <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                    <Target className="h-3 w-3 mr-1" />
                    {contact.target_market?.toUpperCase() || 'GERMANY'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right self-start">
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor()}`}>
                {getStatusText()}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="border-amazon-orange/20">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-amazon-orange mb-1">
                {getCompletionPercentage()}%
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">{t('details.profileCompleteness')}</div>
              <Progress value={getCompletionPercentage()} className="mt-2 h-1.5 sm:h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                <div className="text-base sm:text-lg font-semibold">
                  {Math.ceil((Date.now() - new Date(contact.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                </div>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">{t('details.daysSinceCreation')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
                {contact.email_sent ? (
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                )}
                <div className="text-base sm:text-lg font-semibold">
                  {contact.email_sent ? t('common:buttons.yes') : t('common:buttons.no')}
                </div>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">{t('details.emailStatus')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
                {contact.form_completed ? (
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                ) : (
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                )}
                <div className="text-base sm:text-lg font-semibold">
                  {contact.form_completed ? t('details.completed') : t('details.pending')}
                </div>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">{t('details.formStatus')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Company Information */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amazon-blue" />
                {t('details.companyInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between group">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <Building className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{t('details.companyName')}</div>
                      <div className="text-sm text-muted-foreground break-words">{contact.company_name}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(contact.company_name, t('details.companyName'))}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                {contact.legal_form && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{t('details.legalForm')}</div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {contact.legal_form}
                      </Badge>
                    </div>
                  </div>
                )}

                {contact.company_address && (
                  <div className="flex items-start justify-between group">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{t('details.address')}</div>
                        <div className="text-sm text-muted-foreground leading-relaxed break-words">
                          {contact.company_address}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(contact.company_address!, t('details.address'))}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {contact.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{t('details.website')}</div>
                      <div className="flex items-center gap-2">
                        <a
                          href={contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-amazon-blue hover:underline flex items-center gap-1"
                        >
                          {contact.website}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Person */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-amazon-blue" />
                {t('details.contactPerson')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(contact.contact_person_first_name || contact.contact_person_last_name || contact.contact_person_position) ? (
                <div className="space-y-3">
                  {(contact.contact_person_first_name || contact.contact_person_last_name) && (
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">{t('details.name')}</div>
                          <div className="text-sm text-muted-foreground">
                            {contact.contact_person_first_name} {contact.contact_person_last_name}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${contact.contact_person_first_name} ${contact.contact_person_last_name}`, t('details.name'))}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {contact.contact_person_position && (
                    <div className="flex items-center gap-3">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{t('details.position')}</div>
                        <Badge variant="secondary" className="text-xs">
                          {contact.contact_person_position}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{t('details.email')}</div>
                        <div className="text-sm text-muted-foreground">{contact.email_address}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(contact.email_address, t('details.email'))}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  {contact.phone_number && (
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">{t('details.phone')}</div>
                          <div className="text-sm text-muted-foreground">{contact.phone_number}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(contact.phone_number!, t('details.phoneNumber'))}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <div className="text-sm">{t('details.noContactPerson')}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amazon-blue" />
                {t('details.timeline')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{t('details.contactCreated')}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(contact.created_at)}
                    </div>
                  </div>
                </div>

                {contact.email_sent && (
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-amazon-orange rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{t('details.emailSent')}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(contact.email_sent_at)}
                      </div>
                    </div>
                  </div>
                )}

                {contact.form_completed && (
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{t('details.formCompleted')}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(contact.form_completed_at)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Market-Specific Details (wenn verfügbar) */}
          {contact.form_completed && (
            <>
              {isBicycleDelivery ? (
                <ContactDetailsBicycleDelivery contact={contact} />
              ) : (
                <ContactDetailsVanTransport contact={contact} />
              )}

              {/* Stadt-Verfügbarkeit Details */}
              {contact.city_availability && Object.keys(contact.city_availability).length > 0 && (
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-amazon-blue" />
                      {t('details.cities')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(contact.city_availability).map(([city, available]) => (
                        <div key={city} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{city}</span>
                          {available ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {t('details.available')}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <XCircle className="h-3 w-3 mr-1" />
                              {t('details.available')}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Comments */}
              {contact.additional_comments && (
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-amazon-blue" />
                      {t('list.export.additionalComments')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {contact.additional_comments}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Email Tracking */}
          <div className="lg:col-span-2">
            <EmailTracking contactId={contact.id} emailSent={contact.email_sent} />
          </div>
        </div>

        {/* Formular Link Card */}
        <Card className="mt-6 border-amazon-orange/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amazon-orange" />
              {t('list.actions.form')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{t('list.actions.form')}</div>
                <div className="text-sm text-muted-foreground">
                  {generateFormUrl(
                    window.location.origin,
                    contact.market_type || 'van_transport',
                    contact.target_market || 'germany',
                    contact.id
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(
                    generateFormUrl(
                      window.location.origin,
                      contact.market_type || 'van_transport',
                      contact.target_market || 'germany',
                      contact.id
                    ),
                    t('list.actions.form')
                  )}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {t('common:buttons.copy', { defaultValue: 'Copy' })}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => window.open(
                    generateFormUrl(
                      '',
                      contact.market_type || 'van_transport',
                      contact.target_market || 'germany',
                      contact.id
                    ),
                    '_blank'
                  )}
                  className="bg-amazon-orange hover:bg-amazon-orange/90"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t('list.actions.openForm')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <ContactComments contactId={contact.id} />

        {/* Edit Contact Dialog */}
        {editingContact && (
          <EditContact
            contact={editingContact}
            isOpen={!!editingContact}
            onClose={() => setEditingContact(null)}
            onSave={refreshContact}
          />
        )}
      </div>
    </div>
  );
};

export default ContactDetailsPage;