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
  const { t, i18n } = useTranslation(['contacts', 'forms', 'common']);

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
      
      // Helper function to format boolean values with translations
      const formatBoolean = (value: boolean | null | undefined) => {
        if (value === null || value === undefined) return t('details.noData');
        return value ? t('details.booleanYes') : t('details.booleanNo');
      };
      
      // Helper function to format arrays with translations
      const formatArray = (arr: string[] | undefined | null, fallback?: string) => {
        if (!arr || !Array.isArray(arr) || arr.length === 0) return fallback || t('details.noData');
        return arr.join(', ');
      };

      // Helper function to format date
      const formatDate = (dateString?: string) => {
        if (!dateString) return t('details.noData');
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
      pdf.text(`${t('common:labels.status', { defaultValue: 'Status' })}: ${statusText}`, pageWidth - 80, 25);
      
      currentY = 50;
      
      // Quick Stats Row
      pdf.setTextColor(85, 85, 85);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('details.profileCompleteness'), margin, currentY);
      
      currentY += 15;
      const completionPercentage = getCompletionPercentage();
      const daysOld = Math.ceil((Date.now() - new Date(contact.created_at).getTime()) / (1000 * 60 * 60 * 24));
      
      // Stats in columns
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      // Column 1: Completion
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('details.profileCompleteness') + ':', margin, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(255, 153, 0);
      pdf.text(`${completionPercentage}%`, margin + 45, currentY);
      
      // Column 2: Days since creation
      pdf.setTextColor(85, 85, 85);
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('details.daysSinceCreation') + ':', margin + 90, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${daysOld} ${t('common:labels.days', { defaultValue: 'days' })}`, margin + 135, currentY);
      
      currentY += 20;
      
      // Company Information Section
      checkPageSpace(60);
      pdf.setTextColor(35, 47, 62);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('details.companyData'), margin, currentY);
      
      currentY += 15;
      pdf.setTextColor(85, 85, 85);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const companyInfo = [
        [t('details.companyName') + ':', contact.company_name],
        [t('details.email') + ':', contact.email_address],
        [t('details.phone') + ':', contact.phone_number || t('details.noData')],
        [t('details.address') + ':', contact.company_address || t('details.noData')],
        [t('details.legalForm') + ':', contact.legal_form || t('details.noData')],
        [t('details.website') + ':', contact.website || t('details.noData')],
        [t('details.establishedYear') + ':', contact.company_established_year?.toString() || t('details.noData')],
        [t('details.ownsVehicles') + ':', formatBoolean(contact.company_owns_vehicles)]
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
        pdf.text(t('details.contactPerson'), margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const contactInfo = [
          [t('details.name') + ':', contact.contact_person_name || t('details.noData')],
          [t('details.position') + ':', contact.contact_person_position || t('details.noData')]
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
      const pageTitle = isBicycleDelivery ? t('details.bicycleDeliveryDetails') : t('details.vanTransportDetails');
      pdf.text(pageTitle, margin, currentY);
      
      currentY += 20;

      if (isBicycleDelivery) {
        // BICYCLE DELIVERY SPECIFIC SECTIONS
        
        // Personnel Section
        pdf.setTextColor(35, 47, 62);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(t('details.personnelStructure'), margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const bicyclePersonnelInfo = [
          [t('details.deliveryDrivers') + ':', contact.delivery_driver_count?.toString() || t('details.noData')],
          [t('details.bicycleDrivers') + ':', contact.bicycle_driver_count?.toString() || t('details.noData')],
          [t('details.employmentStatus') + ':', contact.employment_status || t('details.noData')],
          [t('details.employeeType') + ':', contact.employee_type || t('details.noData')],
          [t('details.staffTypes') + ':', formatArray(contact.staff_types)]
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
        pdf.text(t('details.vehiclesEquipment'), margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const bicycleEquipmentInfo = [
          [t('details.bicycles') + ':', contact.bicycle_count?.toString() || t('details.noData')],
          [t('details.cargoBikes') + ':', contact.cargo_bike_count?.toString() || t('details.noData')],
          [t('details.usesCargoBikes') + ':', formatBoolean(contact.uses_cargo_bikes)],
          [t('details.ownsVehicles') + ':', formatBoolean(contact.company_owns_vehicles)],
          [t('details.totalVehicles') + ':', contact.total_vehicle_count?.toString() || t('details.noData')]
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
        pdf.text(t('details.platformExperience'), margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const platformInfo = [
          [t('details.quickCommerce') + ':', formatBoolean(contact.works_for_quick_commerce)],
          [t('details.gigEconomyFood') + ':', formatBoolean(contact.works_for_gig_economy_food)],
          [t('details.quickCommercePlatforms') + ':', formatArray(contact.quick_commerce_companies)],
          [t('details.gigEconomyPlatforms') + ':', formatArray(contact.gig_economy_companies)]
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
        pdf.text(t('details.personnelStructure'), margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const vanPersonnelInfo = [
          [t('details.fullTimeDrivers') + ':', contact.full_time_drivers?.toString() || t('details.noData')],
          [t('details.transporters') + ':', contact.transporter_count?.toString() || t('details.noData')],
          [t('details.staffTypes') + ':', formatArray(contact.staff_types)],
          [t('details.lastMileLogistics') + ':', formatBoolean(contact.is_last_mile_logistics)],
          [t('details.since') + ':', contact.last_mile_since_when || t('details.noData')]
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
        
        // Vehicle & Amazon Experience Section  
        checkPageSpace(60);
        pdf.setTextColor(35, 47, 62);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(t('details.vehiclesEquipment'), margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const vanVehicleInfo = [
          [t('details.vehicleTypes') + ':', formatArray(contact.vehicle_types)],
          [t('details.totalVehicles') + ':', contact.total_vehicle_count?.toString() || t('details.noData')],
          [t('details.amazonExperience') + ':', formatBoolean(contact.amazon_experience)],
          [t('forms:publicForm.logistics.amazonWorkCapacity') + ':', contact.amazon_work_capacity || t('details.noData')]
        ];
        
        vanVehicleInfo.forEach(([label, value]) => {
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
        pdf.text(t('details.operatingCities'), margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const cities = formatArray(contact.operating_cities);
        const cityLines = pdf.splitTextToSize(cities, maxWidth);
        pdf.text(cityLines, margin, currentY);
        currentY += cityLines.length * 6 + 15;
      }

      // Additional Comments Section
      if (contact.additional_comments) {
        checkPageSpace(40);
        pdf.setTextColor(35, 47, 62);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(t('common:labels.comments', { defaultValue: 'Comments' }), margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const commentLines = pdf.splitTextToSize(contact.additional_comments, maxWidth);
        pdf.text(commentLines, margin, currentY);
        currentY += commentLines.length * 6 + 20;
      }

      // Timeline Section
      checkPageSpace(50);
      pdf.setTextColor(35, 47, 62);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('details.timeline'), margin, currentY);
      
      currentY += 15;
      pdf.setTextColor(85, 85, 85);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const timelineData = [
        [t('details.contactCreated') + ':', formatDate(contact.created_at)],
        [t('details.emailSent') + ':', contact.email_sent_at ? formatDate(contact.email_sent_at) : t('details.pending')],
        [t('details.formCompleted') + ':', contact.form_completed_at ? formatDate(contact.form_completed_at) : t('details.pending')]
      ];
      
      timelineData.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, margin, currentY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, margin + 70, currentY);
        currentY += 8;
      });

      // ============= FOOTER =============
      
      // Add footer to all pages
      for (let i = 1; i <= currentPage; i++) {
        pdf.setPage(i);
        
        // Footer line
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
        
        // Footer text
        pdf.setTextColor(150, 150, 150);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(t('details.pdfFooter'), margin, pageHeight - 15);
        
        // Page number and date
        const pageInfo = `${t('common:labels.page', { defaultValue: 'Page' })} ${i} ${t('common:labels.of', { defaultValue: 'of' })} ${currentPage}`;
        const generatedText = `${t('details.generated')}: ${formatDate(new Date().toISOString())}`;
        pdf.text(pageInfo, pageWidth - margin - 50, pageHeight - 15);
        pdf.text(generatedText, pageWidth - margin - 80, pageHeight - 5);
      }

      // Save the PDF
      const fileName = `${contact.company_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_profile.pdf`;
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