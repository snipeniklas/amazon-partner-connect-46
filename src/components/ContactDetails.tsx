import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Mail, Phone, Globe, Building, User, CheckCircle, XCircle, 
  MapPin, Calendar, Truck, Users2, Package, Shield, Star,
  Building2, FileText, Clock, Award, ExternalLink, Copy,
  CheckCheck, TrendingUp, Target, Calendar as CalendarIcon,
  Download, FileDown, Bike, Car
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import jsPDF from 'jspdf';
import { ContactDetailsVanTransport } from "./ContactDetailsVanTransport";
import { ContactDetailsBicycleDelivery } from "./ContactDetailsBicycleDelivery";

interface Contact {
  id: string;
  company_name: string;
  email_address: string;
  company_address?: string;
  legal_form?: string;
  website?: string;
  contact_person_name?: string;
  contact_person_position?: string;
  phone_number?: string;
  email_sent: boolean;
  form_completed: boolean;
  created_at: string;
  email_sent_at?: string;
  form_completed_at?: string;
  // Market identification
  market_type?: string;
  target_market?: string;
  // Logistics fields
  is_last_mile_logistics?: boolean;
  operates_last_mile_logistics?: boolean;
  last_mile_since_when?: string;
  operating_cities?: string[];
  food_delivery_services?: boolean;
  food_delivery_platforms?: string[];
  staff_types?: string[];
  full_time_drivers?: number;
  vehicle_types?: string[];
  transporter_count?: number;
  amazon_experience?: boolean;
  city_availability?: any;
  // Bicycle-specific fields
  works_for_quick_commerce?: boolean;
  works_for_gig_economy_food?: boolean;
  company_owns_vehicles?: boolean;
  uses_cargo_bikes?: boolean;
  employee_type?: string;
  employment_status?: string;
  company_established_year?: number;
  amazon_work_capacity?: string;
  bicycle_count?: number;
  cargo_bike_count?: number;
  delivery_driver_count?: number;
  bicycle_driver_count?: number;
  total_vehicle_count?: number;
  operates_multiple_countries?: boolean;
  operates_multiple_cities?: boolean;
  // Platform fields
  quick_commerce_companies?: string[];
  gig_economy_companies?: string[];
  gig_economy_other?: string;
  quick_commerce_other?: string;
  // Contact person name components
  contact_person_first_name?: string;
  contact_person_last_name?: string;
  // Additional comments
  additional_comments?: string;
}

interface ContactDetailsProps {
  contact: Contact;
  onClose: () => void;
  onUpdate: () => void;
}

export const ContactDetails = ({ contact, onClose, onUpdate }: ContactDetailsProps) => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation('contacts');

  // Market identification
  const marketType = contact.market_type || 'van_transport';
  const targetMarket = contact.target_market || 'germany';
  const isBicycleDelivery = marketType === 'bicycle_delivery';

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    const fields = [
      contact.company_name,
      contact.email_address,
      contact.company_address,
      contact.legal_form,
      contact.website,
      contact.contact_person_name,
      contact.contact_person_position,
      contact.phone_number
    ];
    const completed = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completed / fields.length) * 100);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: t('common:messages.success'),
        description: t('contacts:details.copied', { item: label }),
      });
    } catch (err) {
      toast({
        title: t('common:messages.error'),
        description: t('contacts:details.copyError'),
        variant: "destructive",
      });
    }
  };

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
      const marketInfo = `${marketType} | ${targetMarket}`.toUpperCase();
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
        ['Markttyp:', marketType],
        ['Zielmarkt:', targetMarket],
        ['Beschäftigungsstatus:', contact.employment_status || 'Keine Angabe'],
        ['Mitarbeitertyp:', contact.employee_type || 'Keine Angabe']
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
      pdf.text(t('contacts:details.companyInfo'), margin, currentY);
      
      currentY += 15;
      pdf.setTextColor(85, 85, 85);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const companyInfo = [
        [t('contacts:details.companyName') + ':', contact.company_name],
        [t('contacts:details.email') + ':', contact.email_address],
        [t('contacts:details.phone') + ':', contact.phone_number || t('common:messages.noData')],
        [t('contacts:details.address') + ':', contact.company_address || t('common:messages.noData')],
        [t('contacts:details.legalForm') + ':', contact.legal_form || t('common:messages.noData')],
        [t('contacts:details.website') + ':', contact.website || t('common:messages.noData')],
        ['Gründungsjahr:', contact.company_established_year?.toString() || 'Keine Angabe'],
        ['Eigene Fahrzeuge:', formatBoolean(contact.company_owns_vehicles)]
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
      if (contact.contact_person_name || contact.contact_person_position) {
        checkPageSpace(40);
        pdf.setTextColor(35, 47, 62);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(t('contacts:details.contactPerson'), margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const contactInfo = [
          [t('contacts:details.name') + ':', contact.contact_person_name || t('common:messages.noData')],
          [t('contacts:details.position') + ':', contact.contact_person_position || t('common:messages.noData')]
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

      // ============= PAGE 2: MARKET-SPECIFIC DETAILS =============
      
      pdf.addPage();
      currentPage++;
      currentY = 30;
      
      // Page header with market-specific title
      pdf.setTextColor(35, 47, 62);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      const pageTitle = isBicycleDelivery ? 'Fahrrad-Lieferdienst Details' : 'Transporter-Logistik Details';
      pdf.text(pageTitle, margin, currentY);
      
      currentY += 20;

      if (isBicycleDelivery) {
        // BICYCLE DELIVERY SPECIFIC SECTIONS
        
        // Personnel Section
        pdf.setTextColor(35, 47, 62);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Personal & Beschäftigung', margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const bicyclePersonnelInfo = [
          ['Lieferfahrer:', contact.delivery_driver_count?.toString() || 'Keine Angabe'],
          ['Fahrradfahrer:', contact.bicycle_driver_count?.toString() || 'Keine Angabe'],
          ['Beschäftigungsstatus:', contact.employment_status || 'Keine Angabe'],
          ['Mitarbeitertyp:', contact.employee_type || 'Keine Angabe'],
          ['Personalarten:', formatArray(contact.staff_types)]
        ];
        
        bicyclePersonnelInfo.forEach(([label, value]) => {
          checkPageSpace(8);
          pdf.setFont('helvetica', 'bold');
          pdf.text(label, margin, currentY);
          pdf.setFont('helvetica', 'normal');
          const lines = pdf.splitTextToSize(value, maxWidth - 70);
          pdf.text(lines, margin + 70, currentY);
          currentY += Math.max(8, lines.length * 6);
        });
        
        currentY += 15;
        
        // Equipment Section
        checkPageSpace(40);
        pdf.setTextColor(35, 47, 62);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Fahrzeuge & Ausrüstung', margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const bicycleEquipmentInfo = [
          ['Fahrräder:', contact.bicycle_count?.toString() || 'Keine Angabe'],
          ['Cargo Bikes:', contact.cargo_bike_count?.toString() || 'Keine Angabe'],
          ['Nutzt Cargo Bikes:', formatBoolean(contact.uses_cargo_bikes)],
          ['Eigene Fahrzeuge:', formatBoolean(contact.company_owns_vehicles)],
          ['Gesamtfahrzeuge:', contact.total_vehicle_count?.toString() || 'Keine Angabe']
        ];
        
        bicycleEquipmentInfo.forEach(([label, value]) => {
          checkPageSpace(8);
          pdf.setFont('helvetica', 'bold');
          pdf.text(label, margin, currentY);
          pdf.setFont('helvetica', 'normal');
          pdf.text(value, margin + 70, currentY);
          currentY += 8;
        });
        
        currentY += 15;
        
        // Platform Experience Section
        checkPageSpace(60);
        pdf.setTextColor(35, 47, 62);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Plattform-Erfahrung', margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const platformInfo = [
          ['Quick Commerce:', formatBoolean(contact.works_for_quick_commerce)],
          ['Gig Economy Food:', formatBoolean(contact.works_for_gig_economy_food)],
          ['Quick Commerce Plattformen:', formatArray(contact.quick_commerce_companies)],
          ['Gig Economy Plattformen:', formatArray(contact.gig_economy_companies)]
        ];
        
        platformInfo.forEach(([label, value]) => {
          checkPageSpace(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(label, margin, currentY);
          pdf.setFont('helvetica', 'normal');
          const lines = pdf.splitTextToSize(value, maxWidth - 80);
          pdf.text(lines, margin + 80, currentY);
          currentY += Math.max(8, lines.length * 6);
        });

      } else {
        // VAN TRANSPORT SPECIFIC SECTIONS
        
        // Personnel Section
        pdf.setTextColor(35, 47, 62);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Personal & Logistik', margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const vanPersonnelInfo = [
          ['Vollzeit-Fahrer:', contact.full_time_drivers?.toString() || 'Keine Angabe'],
          ['Transporter-Anzahl:', contact.transporter_count?.toString() || 'Keine Angabe'],
          ['Personalarten:', formatArray(contact.staff_types)],
          ['Last-Mile-Logistik:', formatBoolean(contact.is_last_mile_logistics)],
          ['Seit wann:', contact.last_mile_since_when || 'Keine Angabe']
        ];
        
        vanPersonnelInfo.forEach(([label, value]) => {
          checkPageSpace(8);
          pdf.setFont('helvetica', 'bold');
          pdf.text(label, margin, currentY);
          pdf.setFont('helvetica', 'normal');
          const lines = pdf.splitTextToSize(value, maxWidth - 70);
          pdf.text(lines, margin + 70, currentY);
          currentY += Math.max(8, lines.length * 6);
        });
        
        currentY += 15;
        
        // Vehicle Section
        checkPageSpace(40);
        pdf.setTextColor(35, 47, 62);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Fahrzeuge & Ausrüstung', margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const vanVehicleInfo = [
          ['Fahrzeugtypen:', formatArray(contact.vehicle_types)],
          ['Gesamtfahrzeuge:', contact.total_vehicle_count?.toString() || 'Keine Angabe']
        ];
        
        vanVehicleInfo.forEach(([label, value]) => {
          checkPageSpace(8);
          pdf.setFont('helvetica', 'bold');
          pdf.text(label, margin, currentY);
          pdf.setFont('helvetica', 'normal');
          const lines = pdf.splitTextToSize(value, maxWidth - 70);
          pdf.text(lines, margin + 70, currentY);
          currentY += Math.max(8, lines.length * 6);
        });
        
        currentY += 15;
        
        // Platform Experience Section
        checkPageSpace(60);
        pdf.setTextColor(35, 47, 62);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Plattform & Amazon Erfahrung', margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const vanPlatformInfo = [
          ['Food Delivery Services:', formatBoolean(contact.food_delivery_services)],
          ['Food Delivery Plattformen:', formatArray(contact.food_delivery_platforms)],
          ['Amazon Erfahrung:', formatBoolean(contact.amazon_experience)],
          ['Amazon Arbeitskapazität:', contact.amazon_work_capacity || 'Keine Angabe']
        ];
        
        vanPlatformInfo.forEach(([label, value]) => {
          checkPageSpace(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(label, margin, currentY);
          pdf.setFont('helvetica', 'normal');
          const lines = pdf.splitTextToSize(value, maxWidth - 80);
          pdf.text(lines, margin + 80, currentY);
          currentY += Math.max(8, lines.length * 6);
        });
      }
      
      currentY += 15;

      // Operating Cities Section (Common for both)
      if (contact.operating_cities && contact.operating_cities.length > 0) {
        checkPageSpace(40);
        pdf.setTextColor(35, 47, 62);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Tätige Städte', margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const cities = contact.operating_cities.join(', ');
        pdf.setFont('helvetica', 'bold');
        pdf.text('Städte:', margin, currentY);
        pdf.setFont('helvetica', 'normal');
        const cityLines = pdf.splitTextToSize(cities, maxWidth - 40);
        pdf.text(cityLines, margin + 40, currentY);
        currentY += Math.max(8, cityLines.length * 6) + 10;
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
        [t('contacts:details.created') + ':', formatDate(contact.created_at)],
        ['Email versendet:', contact.email_sent_at ? formatDate(contact.email_sent_at) : 'Noch nicht versendet'],
        ['Formular ausgefüllt:', contact.form_completed_at ? formatDate(contact.form_completed_at) : 'Noch nicht ausgefüllt']
      ];
      
      timelineData.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, margin, currentY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, margin + 70, currentY);
        currentY += 8;
      });

      // Add footer on each page
      const addFooter = (pageNum: number) => {
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Seite ${pageNum} - Generiert am ${new Date().toLocaleDateString('de-DE')}`, 
                 margin, pageHeight - 10);
        pdf.text(`${contact.company_name} - Kontaktdetails`, 
                 pageWidth - 80, pageHeight - 10);
      };

      // Add footer to all pages
      for (let i = 1; i <= currentPage; i++) {
        if (i > 1) {
          pdf.setPage(i);
        }
        addFooter(i);
      }

      // Save the PDF
      const fileName = `${contact.company_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_contact_details.pdf`;
      pdf.save(fileName);
      
      toast({
        title: t('contacts:details.pdfCreated'),
        description: t('contacts:details.pdfDownloaded', { fileName }),
      });
      
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: t('common:messages.error'),
        description: t('contacts:details.pdfError'),
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const locale = i18n.language === 'en' ? 'en-US' : 
                  i18n.language === 'fr' ? 'fr-FR' :
                  i18n.language === 'es' ? 'es-ES' :
                  i18n.language === 'it' ? 'it-IT' : 'de-DE';
    return new Date(dateString).toLocaleDateString(locale, {
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
    if (contact.form_completed) return t('contacts:details.completed');
    if (contact.email_sent) return t('contacts:list.status.emailSent');
    return t('contacts:list.status.formPending');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0">
        <ScrollArea className="h-full max-h-[95vh]">
          <div className="p-6">
            {/* Header with Company Info */}
            <div className="bg-gradient-to-r from-amazon-blue to-amazon-blue/80 text-white rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 bg-white/20">
                    <AvatarFallback className="text-2xl font-bold text-amazon-blue bg-white">
                      {contact.company_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{contact.company_name}</h1>
                    <div className="flex items-center gap-4 text-sm text-white/80">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {contact.email_address}
                      </div>
                      {contact.phone_number && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {contact.phone_number}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={generatePDF}
                      variant="secondary"
                      size="sm"
                      className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all"
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      {t('contacts:details.downloadPdf')}
                    </Button>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor()}`}>
                      {getStatusText()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-amazon-orange/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-amazon-orange mb-1">
                    {getCompletionPercentage()}%
                  </div>
                  <div className="text-sm text-muted-foreground">{t('contacts:details.profileCompleteness')}</div>
                  <Progress value={getCompletionPercentage()} className="mt-2 h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <CalendarIcon className="h-5 w-5 text-blue-500" />
                    <div className="text-lg font-semibold">
                      {Math.ceil((Date.now() - new Date(contact.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{t('contacts:details.daysSinceCreation')}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {contact.email_sent ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <div className="text-lg font-semibold">
                      {contact.email_sent ? t('common:buttons.yes') : t('common:buttons.no')}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{t('contacts:details.emailStatus')}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {contact.form_completed ? (
                      <Award className="h-5 w-5 text-gold-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-500" />
                    )}
                    <div className="text-lg font-semibold">
                      {contact.form_completed ? t('contacts:details.completed') : t('contacts:details.pending')}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{t('contacts:details.formStatus')}</div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Information */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    {t('contacts:details.companyInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{t('contacts:details.companyName')}</p>
                          <p className="text-sm text-muted-foreground">{contact.company_name}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(contact.company_name, t('contacts:details.companyName'))}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    {contact.legal_form && (
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{t('contacts:details.legalForm')}</p>
                          <p className="text-sm text-muted-foreground">{contact.legal_form}</p>
                        </div>
                      </div>
                    )}

                    {contact.company_address && (
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{t('contacts:details.address')}</p>
                            <p className="text-sm text-muted-foreground">{contact.company_address}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(contact.company_address!, t('contacts:details.address'))}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {contact.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{t('contacts:details.website')}</p>
                          <a
                            href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            {contact.website}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    )}

                    {contact.company_established_year && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Company Established</p>
                          <p className="text-sm text-muted-foreground font-semibold">
                            {contact.company_established_year}
                          </p>
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
                    <User className="h-5 w-5 text-primary" />
                    {t('contacts:details.contactPerson')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(contact.contact_person_name || contact.contact_person_first_name || contact.contact_person_last_name || contact.contact_person_position) ? (
                    <div className="space-y-4">
                      {(contact.contact_person_name || contact.contact_person_first_name || contact.contact_person_last_name) && (
                        <div className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{t('contacts:details.name')}</p>
                              <p className="text-sm text-muted-foreground">
                                {contact.contact_person_name || 
                                  [contact.contact_person_first_name, contact.contact_person_last_name]
                                    .filter(Boolean)
                                    .join(' ')}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(
                              contact.contact_person_name || 
                              [contact.contact_person_first_name, contact.contact_person_last_name]
                                .filter(Boolean)
                                .join(' '),
                              t('contacts:details.name')
                            )}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {contact.contact_person_position && (
                        <div className="flex items-center gap-3">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{t('contacts:details.position')}</p>
                            <p className="text-sm text-muted-foreground">{contact.contact_person_position}</p>
                          </div>
                        </div>
                      )}

                      {contact.email_address && (
                        <div className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{t('contacts:details.email')}</p>
                              <p className="text-sm text-muted-foreground">{contact.email_address}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(contact.email_address, t('contacts:details.email'))}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {contact.phone_number && (
                        <div className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{t('contacts:details.phone')}</p>
                              <p className="text-sm text-muted-foreground">{contact.phone_number}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(contact.phone_number!, t('contacts:details.phone'))}
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
                      <div className="text-sm">No contact person information available</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Market Type Badge */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Market & Zielmarkt
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {isBicycleDelivery ? <Bike className="h-3 w-3" /> : <Car className="h-3 w-3" />}
                      {isBicycleDelivery ? 'Bicycle Delivery' : 'Van Transport'}
                    </Badge>
                    <Badge variant="outline">{targetMarket}</Badge>
                  </div>
                  {contact.employment_status && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Beschäftigungsstatus: </span>
                      <span className="text-muted-foreground">{contact.employment_status}</span>
                    </div>
                  )}
                  {contact.employee_type && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Mitarbeitertyp: </span>
                      <span className="text-muted-foreground">{contact.employee_type}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Market-Specific Content */}
              {isBicycleDelivery ? (
                <ContactDetailsBicycleDelivery contact={contact} />
              ) : (
                <ContactDetailsVanTransport contact={contact} />
              )}

              {/* Cities (Common for both market types) */}
              {contact.operating_cities && contact.operating_cities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {t('contacts:details.cities')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {contact.operating_cities.map((city, index) => (
                        <Badge key={index} variant="outline">{city}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};