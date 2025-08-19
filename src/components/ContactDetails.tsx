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
      const marketInfo = `${(contact as any).market_type || 'van_transport'} | ${(contact as any).target_market || 'germany'}`.toUpperCase();
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
        ['Markttyp:', (contact as any).market_type || 'van_transport'],
        ['Zielmarkt:', (contact as any).target_market || 'germany'],
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
        ['Mehrere Länder:', formatBoolean(contact.operates_multiple_countries)],
        ['Mehrere Städte:', formatBoolean(contact.operates_multiple_cities)]
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
      
      // Platform Experience Section
      pdf.setTextColor(35, 47, 62);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Plattform-Erfahrung', margin, currentY);
      
      currentY += 15;
      pdf.setTextColor(85, 85, 85);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const platformData = [
        ['Food Delivery Platforms:', formatArray(contact.food_delivery_platforms)],
        ['Quick Commerce:', formatArray(contact.quick_commerce_companies)],
        ['Gig Economy:', formatArray(contact.gig_economy_companies)]
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
        pdf.text(t('contacts:details.operatingCities') + ':', margin, currentY);
        pdf.setFont('helvetica', 'normal');
        const cities = Array.isArray(contact.operating_cities) 
          ? contact.operating_cities.join(', ')
          : contact.operating_cities;
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
        [t('contacts:details.created') + ':', formatDate(contact.created_at)],
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
      if ((contact as any).additional_comments) {
        checkPageSpace(30);
        pdf.setTextColor(35, 47, 62);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Zusätzliche Kommentare', margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const commentLines = pdf.splitTextToSize((contact as any).additional_comments, maxWidth);
        pdf.text(commentLines, margin, currentY);
        currentY += commentLines.length * 6;
      }
      
      // Footer on all pages
      for (let i = 1; i <= currentPage; i++) {
        if (i > 1) pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        const currentDate = new Date();
        const locale = i18n.language === 'en' ? 'en-US' : 
                      i18n.language === 'fr' ? 'fr-FR' :
                      i18n.language === 'es' ? 'es-ES' :
                      i18n.language === 'it' ? 'it-IT' : 'de-DE';
        pdf.text(`${t('contacts:details.generated')} ${currentDate.toLocaleDateString(locale)} ${currentDate.toLocaleTimeString(locale)}`, margin, pageHeight - 20);
        pdf.text(`Seite ${i} von ${currentPage} | ${t('contacts:details.pdfFooter')}`, pageWidth - 120, pageHeight - 20);
      }
      
      // Save PDF
      const fileName = `kontakt_${contact.company_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
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
                            onClick={() => copyToClipboard(contact.phone_number!, t('contacts:details.phoneNumber'))}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">{t('contacts:details.noContactPerson')}</p>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    {t('contacts:details.timeline')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-medium">{t('contacts:details.contactCreated')}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(contact.created_at)}</p>
                      </div>
                    </div>

                    {contact.email_sent && contact.email_sent_at && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-amazon-orange rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium">{t('contacts:details.emailSent')}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(contact.email_sent_at)}</p>
                        </div>
                      </div>
                    )}

                    {contact.form_completed && contact.form_completed_at && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium">{t('contacts:details.formCompleted')}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(contact.form_completed_at)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Market Information */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {isBicycleDelivery ? (
                      <Bike className="h-5 w-5 text-primary" />
                    ) : (
                      <Car className="h-5 w-5 text-primary" />
                    )}
                    Market & Target
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Market Type</p>
                        <Badge variant="outline" className="text-xs font-medium">
                          {marketType === 'bicycle_delivery' ? 'Bicycle Delivery' : 'Van Transport'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Target Market</p>
                        <Badge variant="secondary" className="text-xs font-medium capitalize">
                          {targetMarket}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {(contact.employment_status || contact.employee_type) && (
                    <div className="space-y-3">
                      <Separator />
                      {contact.employment_status && (
                        <div className="flex items-center gap-3">
                          <Users2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Employment Status</p>
                            <Badge variant="secondary" className="text-xs">{contact.employment_status}</Badge>
                          </div>
                        </div>
                      )}
                      {contact.employee_type && (
                        <div className="flex items-center gap-3">
                          <Users2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Employee Type</p>
                            <Badge variant="secondary" className="text-xs">{contact.employee_type}</Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Logistics Information */}
              {contact.form_completed && (
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      {t('contacts:details.logistics')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Core Logistics */}
                      {(contact.is_last_mile_logistics !== undefined || contact.operates_last_mile_logistics !== undefined) && (
                        <div className="flex items-center gap-3">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{t('contacts:details.lastMileLogistics')}</p>
                            <div className="flex items-center gap-2">
                              {(contact.is_last_mile_logistics || contact.operates_last_mile_logistics) ? (
                                <Badge className="bg-green-100 text-green-800">{t('common:buttons.yes')}</Badge>
                              ) : (
                                <Badge variant="outline">{t('common:buttons.no')}</Badge>
                              )}
                              {contact.last_mile_since_when && (
                                <span className="text-xs text-muted-foreground">
                                  {t('contacts:details.since')} {contact.last_mile_since_when}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {contact.food_delivery_services !== undefined && (
                        <div className="flex items-center gap-3">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{t('contacts:details.foodDelivery')}</p>
                            <Badge className={contact.food_delivery_services ? "bg-green-100 text-green-800" : ""}
                                   variant={contact.food_delivery_services ? "default" : "outline"}>
                              {contact.food_delivery_services ? t('common:buttons.yes') : t('common:buttons.no')}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {contact.amazon_experience !== undefined && (
                        <div className="flex items-center gap-3">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{t('contacts:details.amazonExperience')}</p>
                            <div className="flex items-center gap-2">
                              {contact.amazon_experience ? (
                                <Badge className="bg-amazon-orange text-white">
                                  <Star className="h-3 w-3 mr-1" />
                                  {t('contacts:details.available')}
                                </Badge>
                              ) : (
                                <Badge variant="outline">{t('contacts:details.noExperience')}</Badge>
                              )}
                              {contact.amazon_work_capacity && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  {contact.amazon_work_capacity}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Market-specific Services */}
                      {isBicycleDelivery && (
                        <div className="space-y-3">
                          <Separator />
                          <div className="text-sm font-medium text-primary">Service Experience</div>
                          
                          {contact.works_for_quick_commerce !== undefined && (
                            <div className="flex items-center gap-3">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Quick Commerce</p>
                                <Badge className={contact.works_for_quick_commerce ? "bg-green-100 text-green-800" : ""}
                                       variant={contact.works_for_quick_commerce ? "default" : "outline"}>
                                  {contact.works_for_quick_commerce ? 'Yes' : 'No'}
                                </Badge>
                              </div>
                            </div>
                          )}

                          {contact.works_for_gig_economy_food !== undefined && (
                            <div className="flex items-center gap-3">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Gig Economy Food Delivery</p>
                                <Badge className={contact.works_for_gig_economy_food ? "bg-green-100 text-green-800" : ""}
                                       variant={contact.works_for_gig_economy_food ? "default" : "outline"}>
                                  {contact.works_for_gig_economy_food ? 'Yes' : 'No'}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Company Assets */}
                      <div className="space-y-3">
                        <Separator />
                        <div className="text-sm font-medium text-primary">Company Assets</div>
                        
                        {contact.company_owns_vehicles !== undefined && (
                          <div className="flex items-center gap-3">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Company Owns Vehicles</p>
                              <Badge className={contact.company_owns_vehicles ? "bg-green-100 text-green-800" : ""}
                                     variant={contact.company_owns_vehicles ? "default" : "outline"}>
                                {contact.company_owns_vehicles ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                          </div>
                        )}

                        {contact.company_established_year && (
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Company Established</p>
                              <div className="text-lg font-semibold text-primary">
                                {contact.company_established_year}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Personnel Counts */}
                      <div className="space-y-3">
                        <Separator />
                        <div className="text-sm font-medium text-primary">Personnel</div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {contact.delivery_driver_count !== undefined && contact.delivery_driver_count > 0 && (
                            <div className="flex items-center gap-3">
                              <Users2 className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{t('contacts:details.fullTimeDrivers')}</p>
                                <div className="text-lg font-semibold text-primary">
                                  {contact.delivery_driver_count}
                                </div>
                              </div>
                            </div>
                          )}

                          {contact.delivery_driver_count !== undefined && contact.delivery_driver_count > 0 && (
                            <div className="flex items-center gap-3">
                              <Users2 className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Delivery Drivers</p>
                                <div className="text-lg font-semibold text-primary">
                                  {contact.delivery_driver_count}
                                </div>
                              </div>
                            </div>
                          )}

                          {contact.bicycle_driver_count !== undefined && contact.bicycle_driver_count > 0 && (
                            <div className="flex items-center gap-3">
                              <Bike className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Bicycle Drivers</p>
                                <div className="text-lg font-semibold text-primary">
                                  {contact.bicycle_driver_count}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {contact.staff_types && contact.staff_types.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Staff Types</p>
                            <div className="flex flex-wrap gap-1">
                              {contact.staff_types.map((type, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Vehicle Information */}
                      <div className="space-y-3">
                        <Separator />
                        <div className="text-sm font-medium text-primary">Vehicles & Equipment</div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {contact.total_vehicle_count !== undefined && contact.total_vehicle_count > 0 && (
                            <div className="flex items-center gap-3">
                              <Truck className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{t('contacts:details.transporters')}</p>
                                <div className="text-lg font-semibold text-primary">
                                  {contact.total_vehicle_count}
                                </div>
                              </div>
                            </div>
                          )}

                          {contact.bicycle_count !== undefined && contact.bicycle_count > 0 && (
                            <div className="flex items-center gap-3">
                              <Bike className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Bicycles</p>
                                <div className="text-lg font-semibold text-primary">
                                  {contact.bicycle_count}
                                </div>
                              </div>
                            </div>
                          )}

                          {contact.cargo_bike_count !== undefined && contact.cargo_bike_count > 0 && (
                            <div className="flex items-center gap-3">
                              <Truck className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Cargo Bikes</p>
                                <div className="text-lg font-semibold text-primary">
                                  {contact.cargo_bike_count}
                                </div>
                              </div>
                            </div>
                          )}

                          {contact.total_vehicle_count !== undefined && contact.total_vehicle_count > 0 && (
                            <div className="flex items-center gap-3">
                              <Truck className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Total Vehicles</p>
                                <div className="text-lg font-semibold text-primary">
                                  {contact.total_vehicle_count}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {contact.uses_cargo_bikes !== undefined && (
                          <div className="flex items-center gap-3">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Uses Cargo Bikes</p>
                              <Badge className={contact.uses_cargo_bikes ? "bg-green-100 text-green-800" : ""}
                                     variant={contact.uses_cargo_bikes ? "default" : "outline"}>
                                {contact.uses_cargo_bikes ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                          </div>
                        )}

                        {contact.vehicle_types && contact.vehicle_types.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">{t('contacts:details.vehicleTypes')}</p>
                            <div className="flex flex-wrap gap-1">
                              {contact.vehicle_types.map((type, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Operating Scope */}
                      <div className="space-y-3">
                        <Separator />
                        <div className="text-sm font-medium text-primary">Operating Scope</div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {contact.operates_multiple_countries !== undefined && (
                            <div className="flex items-center gap-3">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Multiple Countries</p>
                                <Badge className={contact.operates_multiple_countries ? "bg-green-100 text-green-800" : ""}
                                       variant={contact.operates_multiple_countries ? "default" : "outline"}>
                                  {contact.operates_multiple_countries ? 'Yes' : 'No'}
                                </Badge>
                              </div>
                            </div>
                          )}

                          {contact.operates_multiple_cities !== undefined && (
                            <div className="flex items-center gap-3">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Multiple Cities</p>
                                <Badge className={contact.operates_multiple_cities ? "bg-green-100 text-green-800" : ""}
                                       variant={contact.operates_multiple_cities ? "default" : "outline"}>
                                  {contact.operates_multiple_cities ? 'Yes' : 'No'}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>

                        {contact.operating_cities && contact.operating_cities.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">{t('contacts:details.operatingCities')}</p>
                            <div className="flex flex-wrap gap-1">
                              {contact.operating_cities.slice(0, 5).map((city, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {city}
                                </Badge>
                              ))}
                              {contact.operating_cities.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{contact.operating_cities.length - 5} {t('contacts:details.more')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Platform Experience */}
                      {((contact.quick_commerce_companies && contact.quick_commerce_companies.length > 0) ||
                        (contact.gig_economy_companies && contact.gig_economy_companies.length > 0) ||
                        (contact.food_delivery_platforms && contact.food_delivery_platforms.length > 0) ||
                        contact.gig_economy_other ||
                        contact.quick_commerce_other) && (
                        <div className="space-y-3">
                          <Separator />
                          <div className="text-sm font-medium text-primary">Platform Experience</div>
                          
                          {contact.quick_commerce_companies && contact.quick_commerce_companies.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Quick Commerce Companies</p>
                              <div className="flex flex-wrap gap-1">
                                {contact.quick_commerce_companies.map((company, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {company}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {contact.gig_economy_companies && contact.gig_economy_companies.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Gig Economy Companies</p>
                              <div className="flex flex-wrap gap-1">
                                {contact.gig_economy_companies.map((company, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {company}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {contact.food_delivery_platforms && contact.food_delivery_platforms.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Food Delivery Platforms</p>
                              <div className="flex flex-wrap gap-1">
                                {contact.food_delivery_platforms.map((platform, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {platform}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {contact.gig_economy_other && (
                            <div className="flex items-start gap-3">
                              <Package className="h-4 w-4 text-muted-foreground mt-1" />
                              <div>
                                <p className="text-sm font-medium">Other Gig Economy Platforms</p>
                                <div className="text-sm text-muted-foreground bg-muted/50 rounded p-2 mt-1">
                                  {contact.gig_economy_other}
                                </div>
                              </div>
                            </div>
                          )}

                          {contact.quick_commerce_other && (
                            <div className="flex items-start gap-3">
                              <Package className="h-4 w-4 text-muted-foreground mt-1" />
                              <div>
                                <p className="text-sm font-medium">Other Quick Commerce Platforms</p>
                                <div className="text-sm text-muted-foreground bg-muted/50 rounded p-2 mt-1">
                                  {contact.quick_commerce_other}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Additional Comments */}
                      {contact.additional_comments && (
                        <div className="space-y-3">
                          <Separator />
                          <div className="flex items-start gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                            <div>
                              <p className="text-sm font-medium">Additional Comments</p>
                              <div className="text-sm text-muted-foreground bg-muted/50 rounded p-3 mt-1">
                                {contact.additional_comments}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                {t('contacts:details.contactId')}: {contact.id}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  {t('contacts:details.close')}
                </Button>
                {contact.email_sent && !contact.form_completed && (
                  <Button variant="default" className="bg-amazon-orange hover:bg-amazon-orange/90">
                    {t('contacts:details.resendEmail')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};