import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, ArrowRight, ArrowLeft, Building, Truck, MapPin, Users, MessageSquare, Bike } from "lucide-react";
import { getMarketConfig, MarketConfig } from "@/config/marketConfigs";
import { useMetaPixel } from "@/hooks/useMetaPixel";
import jsPDF from 'jspdf';

const DynamicPublicForm = () => {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  
  // URL Parameters
  const marketType = searchParams.get('market') || 'van_transport';
  const targetMarket = searchParams.get('region') || 'germany';
  
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSummary, setShowSummary] = useState(false);
  const [marketConfig, setMarketConfig] = useState<MarketConfig | null>(null);
  const [metaPixelCode, setMetaPixelCode] = useState<string | null>(null);
  
  // Meta Pixel tracking hook
  const { trackLead, trackContact, trackCompleteRegistration, trackViewContent } = useMetaPixel(metaPixelCode);

  const [formData, setFormData] = useState({
    // Basic Information
    company_name: "",
    company_address: "",
    legal_form: "",
    website: "",
    contact_person_first_name: "",
    contact_person_last_name: "",
    contact_person_position: "",
    phone_number: "",
    email_address: "",
    
    // Market-specific data
    market_type: marketType,
    target_market: targetMarket,
    
    // Logistics/Delivery data
    is_last_mile_logistics: false,
    last_mile_since_when: "",
    operating_cities: [] as string[],
    food_delivery_services: false,
    food_delivery_platforms: [] as string[],
    staff_types: [] as string[],
    full_time_drivers: 0,
    vehicle_types: [] as string[],
    transporter_count: 0,
    amazon_experience: false,
    city_availability: {} as Record<string, boolean>,
    additional_comments: "",
    
    // Bicycle-specific fields
    works_for_quick_commerce: null,
    works_for_gig_economy_food: null,
    
    company_owns_vehicles: null,
    uses_cargo_bikes: false,
    employee_type: "",
    company_established_year: null as number | null,
    amazon_work_capacity: "",
    bicycle_count: null as number | null,
    cargo_bike_count: null as number | null,
    delivery_driver_count: null as number | null,
    bicycle_driver_count: null as number | null,
    total_vehicle_count: null as number | null,
    operates_multiple_countries: false,
    operates_multiple_cities: false,
    
    // UK/Ireland specific fields
    employment_status: "",
    quick_commerce_companies: [] as string[],
    gig_economy_companies: [] as string[],
    gig_economy_other: "",
    quick_commerce_other: "",
  });

  // Get total steps based on market type
  const getTotalSteps = () => {
    return marketType === 'bicycle_delivery' ? 4 : 4;
  };

  const getStepIcon = (step: number) => {
    if (marketType === 'bicycle_delivery') {
      switch (step) {
        case 1: return Building;
        case 2: return Bike;
        case 3: return Users;
        case 4: return MapPin;
        default: return Building;
      }
    } else {
      switch (step) {
        case 1: return Building;
        case 2: return Truck;
        case 3: return Users;
        case 4: return MapPin;
        default: return Building;
      }
    }
  };

  useEffect(() => {
    // Set language based on target market automatically
    const getLanguageForMarket = (market: string) => {
      switch (market) {
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
          return 'de';
        default:
          return 'en'; // fallback to English
      }
    };

    // First check if there's a lang parameter in URL (for manual override)
    const lang = searchParams.get('lang');
    if (lang && ['en', 'de', 'fr', 'es', 'it'].includes(lang)) {
      i18n.changeLanguage(lang);
    } else {
      // Otherwise, automatically set language based on target market
      const targetLanguage = getLanguageForMarket(targetMarket);
      if (i18n.language !== targetLanguage) {
        i18n.changeLanguage(targetLanguage);
      }
    }

    // Load market configuration
    const config = getMarketConfig(marketType, targetMarket);
    setMarketConfig(config);

    // Load Meta Pixel configuration
    fetchMetaPixelCode();
  }, [searchParams, i18n, marketType, targetMarket]);

  useEffect(() => {
    const fetchContact = async () => {
      // If no contactId, we're in "new contact" mode - skip fetching
      if (!contactId) {
        setLoading(false);
        return;
      }

      // Demo mode: Use demo data instead of fetching from database
      if (contactId === "demo") {
        const demoData = {
          id: "demo",
          company_name: "Demo Logistics GmbH",
          company_address: "Musterstraße 123, 12345 Berlin",
          legal_form: "GmbH",
          website: "https://demo-logistics.com",
          contact_person_first_name: "Max",
          contact_person_last_name: "Mustermann",
          contact_person_position: "Geschäftsführer",
          phone_number: "+49 30 12345678",
          email_address: "max@demo-logistics.com",
          market_type: marketType,
          target_market: targetMarket,
          is_last_mile_logistics: true,
          last_mile_since_when: "2020",
          operating_cities: marketConfig?.cities || marketConfig?.zones || [],
          food_delivery_services: marketType === 'bicycle_delivery',
          food_delivery_platforms: marketType === 'bicycle_delivery' ? ['Deliveroo', 'UberEats'] : [],
          staff_types: marketConfig?.staffTypes?.slice(0, 2) || [],
          full_time_drivers: 15,
          vehicle_types: marketConfig?.vehicleTypes?.slice(0, 2) || [],
          transporter_count: 10,
          amazon_experience: marketType === 'van_transport',
          city_availability: {},
          additional_comments: "Demo-Daten für Vorschau-Zwecke",
          // Bicycle-specific demo data
          works_for_quick_commerce: marketType === 'bicycle_delivery',
          works_for_gig_economy_food: marketType === 'bicycle_delivery',
          
          company_owns_vehicles: true,
          uses_cargo_bikes: marketType === 'bicycle_delivery',
          employee_type: "both",
          company_established_year: 2019,
          amazon_work_capacity: marketType === 'bicycle_delivery' ? "No previous Amazon experience" : "Worked as delivery partner from 2018-2020",
          bicycle_count: marketType === 'bicycle_delivery' ? 25 : null,
          cargo_bike_count: marketType === 'bicycle_delivery' ? 8 : null,
          delivery_driver_count: marketType === 'bicycle_delivery' ? 20 : null,
          bicycle_driver_count: marketType === 'bicycle_delivery' ? 15 : null,
          total_vehicle_count: marketType === 'bicycle_delivery' ? 33 : 10,
          operates_multiple_countries: false,
          operates_multiple_cities: true,
          // UK/Ireland specific demo data
          employment_status: (targetMarket === 'uk' || targetMarket === 'ireland') ? "both" : "",
          quick_commerce_companies: (targetMarket === 'uk' || targetMarket === 'ireland') ? ["Getir", "Gorillas"] : [],
          gig_economy_companies: (targetMarket === 'uk' || targetMarket === 'ireland') ? ["Deliveroo", "Uber Eats"] : [],
        };

        setContact(demoData);
        setFormData(prev => ({
          ...prev,
          company_name: demoData.company_name,
          company_address: demoData.company_address,
          legal_form: demoData.legal_form,
          website: demoData.website,
          contact_person_first_name: demoData.contact_person_first_name,
          contact_person_last_name: demoData.contact_person_last_name,
          contact_person_position: demoData.contact_person_position,
          phone_number: demoData.phone_number,
          email_address: demoData.email_address,
          market_type: demoData.market_type,
          target_market: demoData.target_market,
          is_last_mile_logistics: demoData.is_last_mile_logistics,
          last_mile_since_when: demoData.last_mile_since_when,
          operating_cities: demoData.operating_cities,
          food_delivery_services: demoData.food_delivery_services,
          food_delivery_platforms: demoData.food_delivery_platforms,
          staff_types: demoData.staff_types,
          full_time_drivers: demoData.full_time_drivers,
          vehicle_types: demoData.vehicle_types,
          transporter_count: demoData.transporter_count,
          amazon_experience: demoData.amazon_experience,
          city_availability: demoData.city_availability,
          additional_comments: demoData.additional_comments,
          // Bicycle-specific demo data
          works_for_quick_commerce: demoData.works_for_quick_commerce,
          works_for_gig_economy_food: demoData.works_for_gig_economy_food,
          
          company_owns_vehicles: demoData.company_owns_vehicles,
          uses_cargo_bikes: demoData.uses_cargo_bikes,
          employee_type: demoData.employee_type,
          company_established_year: demoData.company_established_year,
          amazon_work_capacity: demoData.amazon_work_capacity,
          bicycle_count: demoData.bicycle_count,
          cargo_bike_count: demoData.cargo_bike_count,
          delivery_driver_count: demoData.delivery_driver_count,
          bicycle_driver_count: demoData.bicycle_driver_count,
          total_vehicle_count: demoData.total_vehicle_count,
          operates_multiple_countries: demoData.operates_multiple_countries,
          operates_multiple_cities: demoData.operates_multiple_cities,
          // UK/Ireland specific demo data
          employment_status: demoData.employment_status,
          quick_commerce_companies: demoData.quick_commerce_companies,
          gig_economy_companies: demoData.gig_economy_companies,
        }));
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', contactId)
          .single();

        if (!error && data) {
          setContact(data);
          // Pre-fill known data
          setFormData(prev => ({
            ...prev,
            company_name: data.company_name || "",
            company_address: data.company_address || "",
            legal_form: data.legal_form || "",
            website: data.website || "",
            contact_person_first_name: data.contact_person_first_name || "",
            contact_person_last_name: data.contact_person_last_name || "",
            contact_person_position: data.contact_person_position || "",
            phone_number: data.phone_number || "",
            email_address: data.email_address || "",
            market_type: (data as any).market_type || marketType,
            target_market: (data as any).target_market || targetMarket,
            // Pre-filled logistics data
            is_last_mile_logistics: data.is_last_mile_logistics || false,
            last_mile_since_when: data.last_mile_since_when || "",
            operating_cities: Array.isArray(data.operating_cities) ? data.operating_cities : [],
            food_delivery_services: data.food_delivery_services || false,
            food_delivery_platforms: Array.isArray(data.food_delivery_platforms) ? data.food_delivery_platforms : [],
            staff_types: Array.isArray(data.staff_types) ? data.staff_types : [],
            full_time_drivers: data.full_time_drivers || 0,
            vehicle_types: Array.isArray(data.vehicle_types) ? data.vehicle_types : [],
            transporter_count: data.transporter_count || 0,
            amazon_experience: data.amazon_experience || false,
            city_availability: (typeof data.city_availability === 'object' && data.city_availability !== null) 
              ? data.city_availability as Record<string, boolean>
              : {},
            additional_comments: data.additional_comments || "",
          }));
        }
      } catch (error) {
        console.error('Error fetching contact:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [contactId, marketType, targetMarket, marketConfig]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Console logging für Formular-Eingaben
      console.log(`[FORM INPUT] ${field}:`, value);
      console.log('[COMPLETE FORM DATA]:', newData);
      
      return newData;
    });
  };

  const fetchMetaPixelCode = async () => {
    try {
      const { data, error } = await supabase
        .from('meta_pixel_settings')
        .select('pixel_code')
        .eq('market_type', marketType)
        .eq('target_market', targetMarket)
        .single();

      if (!error && data) {
        setMetaPixelCode(data.pixel_code);
      }
    } catch (error) {
      console.error('Error fetching Meta Pixel Code:', error);
    }
  };

  // Track step changes for better analytics
  useEffect(() => {
    if (metaPixelCode && currentStep > 1) {
      trackViewContent({
        content_name: `Step ${currentStep} - ${formData.market_type}`,
        content_category: 'form_step',
        value: currentStep
      });
    }
  }, [currentStep, metaPixelCode]);

  const generatePDF = () => {
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
      pdf.text(formData.company_name || t("forms:publicForm.title"), margin, 20);
      
      // Market type and target market info
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const marketInfo = `${formData.market_type} | ${formData.target_market}`.toUpperCase();
      pdf.text(marketInfo, pageWidth - 80, 15);
      
      // Date and form status
      pdf.text(`Formular Status: ${contactId ? 'Ausgefüllt' : 'Demo'}`, pageWidth - 80, 25);
      
      currentY = 50;
      
      // Quick Stats Row
      pdf.setTextColor(85, 85, 85);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Formular-Übersicht', margin, currentY);
      
      currentY += 15;
      const currentDate = new Date();
      
      // Stats in columns
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      // Column 1: Market Type
      pdf.setFont('helvetica', 'bold');
      pdf.text('Markttyp:', margin, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formData.market_type, margin + 45, currentY);
      
      // Column 2: Target Market
      pdf.setFont('helvetica', 'bold');
      pdf.text('Zielmarkt:', margin + 90, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formData.target_market, margin + 135, currentY);
      
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
        ['Markttyp:', formData.market_type || 'van_transport'],
        ['Zielmarkt:', formData.target_market || 'germany'],
        ['Beschäftigungsstatus:', formData.employment_status || 'Keine Angabe'],
        ['Mitarbeitertyp:', formData.employee_type || 'Keine Angabe']
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
      pdf.text(t("forms:publicForm.companyData.title"), margin, currentY);
      
      currentY += 15;
      pdf.setTextColor(85, 85, 85);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const companyInfo = [
        [t("forms:publicForm.companyData.companyName") + ':', formData.company_name || 'Keine Angabe'],
        [t("forms:publicForm.companyData.email") + ':', formData.email_address || 'Keine Angabe'],
        [t("forms:publicForm.companyData.phone") + ':', formData.phone_number || 'Keine Angabe'],
        [t("forms:publicForm.companyData.address") + ':', formData.company_address || 'Keine Angabe'],
        ['Rechtsform:', formData.legal_form || 'Keine Angabe'],
        [t("forms:publicForm.companyData.website") + ':', formData.website || 'Keine Angabe'],
        ['Gründungsjahr:', formData.company_established_year?.toString() || 'Keine Angabe'],
        ['Eigene Fahrzeuge:', formatBoolean(formData.company_owns_vehicles)]
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
      const contactPersonName = [formData.contact_person_first_name, formData.contact_person_last_name]
        .filter(Boolean).join(' ');
      
      if (contactPersonName || formData.contact_person_position) {
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
          ['Position:', formData.contact_person_position || 'Keine Angabe']
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
        ['Last-Mile-Logistik:', formatBoolean(formData.is_last_mile_logistics)],
        ['Seit wann:', formData.last_mile_since_when || 'Keine Angabe'],
        
        ['Food Delivery Services:', formatBoolean(formData.food_delivery_services)],
        ['Amazon Erfahrung:', formatBoolean(formData.amazon_experience)],
        ['Amazon Arbeitskapazität:', formData.amazon_work_capacity || 'Keine Angabe'],
        ['Quick Commerce:', formatBoolean(formData.works_for_quick_commerce)],
        ['Gig Economy Food:', formatBoolean(formData.works_for_gig_economy_food)]
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
      
      // Personnel Structure Section
      checkPageSpace(40);
      pdf.setTextColor(35, 47, 62);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Personal-Struktur', margin, currentY);
      
      currentY += 15;
      pdf.setTextColor(85, 85, 85);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const personnelInfo = [
        ['Vollzeit-Fahrer:', formData.full_time_drivers?.toString() || '0'],
        ['Delivery Driver:', formData.delivery_driver_count?.toString() || '0'],
        ['Bicycle Driver:', formData.bicycle_driver_count?.toString() || '0'],
        ['Transporter:', formData.transporter_count?.toString() || '0'],
        ['Personal-Typen:', formatArray(formData.staff_types)]
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
      
      // Advanced Vehicle Information Section
      checkPageSpace(60);
      pdf.setTextColor(35, 47, 62);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Fahrzeug-Details', margin, currentY);
      
      currentY += 15;
      pdf.setTextColor(85, 85, 85);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const vehicleInfo = [
        ['Fahrzeug-Typen:', formatArray(formData.vehicle_types)],
        ['Gesamtfahrzeuge:', formData.total_vehicle_count?.toString() || '0'],
        ['Fahrräder:', formData.bicycle_count?.toString() || '0'],
        ['Cargo Bikes:', formData.cargo_bike_count?.toString() || '0'],
        ['Nutzt Cargo Bikes:', formatBoolean(formData.uses_cargo_bikes)]
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
        ['Mehrere Länder:', formatBoolean(formData.operates_multiple_countries)],
        ['Mehrere Städte:', formatBoolean(formData.operates_multiple_cities)]
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
      pdf.text('Plattformen, Städte & Details', margin, currentY);
      
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
        ['Food Delivery Platforms:', formatArray(formData.food_delivery_platforms)],
        ['Quick Commerce:', formatArray(formData.quick_commerce_companies)],
        ['Gig Economy:', formatArray(formData.gig_economy_companies)]
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
      if (formData.operating_cities && formData.operating_cities.length > 0) {
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
        const cities = formData.operating_cities.join(', ');
        const cityLines = pdf.splitTextToSize(cities, maxWidth - 80);
        pdf.text(cityLines, margin + 80, currentY);
        currentY += Math.max(8, cityLines.length * 6) + 10;
      }
      
      // Available Cities/Zones Section
      if (formData.city_availability && Object.keys(formData.city_availability).length > 0) {
        checkPageSpace(30);
        pdf.setTextColor(35, 47, 62);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Verfügbare Gebiete', margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const availableCities = Object.entries(formData.city_availability)
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
      
      // Form Status Section
      checkPageSpace(50);
      pdf.setTextColor(35, 47, 62);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Formular Status', margin, currentY);
      
      currentY += 15;
      pdf.setTextColor(85, 85, 85);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const statusData = [
        ['Erstellt:', currentDate.toLocaleDateString('de-DE')],
        ['Formular-Typ:', marketType === 'bicycle_delivery' ? 'Bicycle Delivery' : 'Van Transport'],
        ['Region:', formData.target_market],
        ['Status:', contactId === 'demo' ? 'Demo Modus' : 'Ausgefüllt']
      ];
      
      statusData.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, margin, currentY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, margin + 80, currentY);
        currentY += 8;
      });
      
      currentY += 15;
      
      // Comments Section
      if (formData.additional_comments) {
        checkPageSpace(30);
        pdf.setTextColor(35, 47, 62);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(t("forms:contactForm.fields.notes"), margin, currentY);
        
        currentY += 15;
        pdf.setTextColor(85, 85, 85);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const commentLines = pdf.splitTextToSize(formData.additional_comments, maxWidth);
        pdf.text(commentLines, margin, currentY);
        currentY += commentLines.length * 6;
      }
      
      // Footer on all pages
      for (let i = 1; i <= currentPage; i++) {
        if (i > 1) pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Generiert: ${currentDate.toLocaleDateString('de-DE')} um ${currentDate.toLocaleTimeString('de-DE')}`, margin, pageHeight - 20);
        pdf.text(`Seite ${i} von ${currentPage} | Formular Zusammenfassung`, pageWidth - 120, pageHeight - 20);
      }
      
      // Save PDF
      const fileName = `formular_${formData.company_name?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'unbekannt'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: 'PDF erstellt',
        description: `PDF wurde erfolgreich generiert: ${fileName}`,
      });
      
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Fehler',
        description: 'Beim Erstellen der PDF ist ein Fehler aufgetreten.',
        variant: "destructive",
      });
    }
  };

  const toggleArrayItem = (field: string, item: string) => {
    setFormData(prev => {
      const currentValue = prev[field as keyof typeof prev];
      if (Array.isArray(currentValue)) {
        return {
          ...prev,
          [field]: currentValue.includes(item)
            ? currentValue.filter((i: string) => i !== item)
            : [...currentValue, item]
        };
      }
      return prev;
    });
  };

  const toggleLocationAvailability = (location: string) => {
    setFormData(prev => ({
      ...prev,
      city_availability: {
        ...prev.city_availability,
        [location]: !prev.city_availability[location]
      }
    }));
  };

  const getCurrentStepProgress = () => {
    return Math.round((currentStep / getTotalSteps()) * 100);
  };

  // Validation functions
   const getRequiredFieldsForStep = (step: number) => {
      switch (step) {
        case 1:
          return {
            company_name: 'Firmenname',
            email_address: 'E-Mail-Adresse',
            company_address: 'Firmenadresse',
            website: 'Website',
            contact_person_first_name: 'Ansprechpartner Vorname',
            phone_number: 'Telefonnummer'
          };
         case 2:
           const step2Fields: any = {
             company_established_year: 'Gründungsjahr',
             is_last_mile_logistics: marketType === 'bicycle_delivery' ? 'Bicycle Delivery Erfahrung' : 'Logistik-Erfahrung',
              amazon_work_capacity: 'Amazon Arbeitskapazität'
           };
           
           // If they have experience, the experience year is required
           if (formData.is_last_mile_logistics) {
             step2Fields.last_mile_since_when = 'Erfahrung seit Jahr';
           }
           
           if (marketType === 'bicycle_delivery') {
             step2Fields.works_for_quick_commerce = 'Quick Commerce Arbeit';
             step2Fields.works_for_gig_economy_food = 'Gig Economy Food Arbeit';
             step2Fields.bicycle_count = 'Anzahl Fahrräder';
             step2Fields.cargo_bike_count = 'Anzahl Lastenfahrräder';
           }
           
           if (marketType === 'van_transport') {
             step2Fields.legal_form = 'Legal Status';
             step2Fields.vehicle_types = 'Vehicle Types';
             step2Fields.amazon_work_capacity = 'Amazon Work Capacity';
             step2Fields.works_for_quick_commerce = 'Quick Commerce Arbeit';
             step2Fields.works_for_gig_economy_food = 'Gig Economy Food Arbeit';
           }
           
           return step2Fields;
         case 3:
            const step3Fields: any = {
               staff_types: 'Mitarbeitertypen (mindestens einer)'
            };
           
           // Add employee/staff questions moved from step 2
           if (marketType === 'van_transport') {
             step3Fields.delivery_driver_count = 'Anzahl Lieferfahrer';
           }
           
           if (marketType === 'bicycle_delivery') {
             step3Fields.delivery_driver_count = 'Anzahl Lieferfahrer';
             step3Fields.bicycle_driver_count = 'Anzahl Fahrrad-Fahrer';
           }
           
           return step3Fields;
        case 4:
          const step4Fields: any = {
            city_availability: 'Standortverfügbarkeit (mindestens eine Stadt/Zone)'
          };
          
          // Validate gig_economy_other field if "other" is selected for UK/Ireland markets
          if ((targetMarket === 'uk' || targetMarket === 'ireland') && formData.gig_economy_companies?.includes('other')) {
            step4Fields.gig_economy_other = 'Gig Economy Andere (Beschreibung)';
          }
          
          // Validate quick_commerce_other field if "other" is selected for UK/Ireland markets
          if ((targetMarket === 'uk' || targetMarket === 'ireland') && formData.quick_commerce_companies?.includes('other')) {
            step4Fields.quick_commerce_other = 'Quick Commerce Andere (Beschreibung)';
          }
          
          return step4Fields;
        default:
          return {};
      }
    };

    const validateStepFields = useCallback((step: number) => {
      const requiredFields = getRequiredFieldsForStep(step);
      const missingFields: string[] = [];

      console.log(`[VALIDATION] Schritt ${step} - Erforderliche Felder:`, requiredFields);

      Object.entries(requiredFields).forEach(([field, label]) => {
        const value = formData[field as keyof typeof formData];
        console.log(`[VALIDATION] Prüfe Feld "${field}" (${label}):`, value);
       
       if (field === 'staff_types' || field === 'vehicle_types') {
         if (!Array.isArray(value) || value.length === 0) {
           missingFields.push(label as string);
           console.log(`[VALIDATION ERROR] Array-Feld "${field}" ist leer oder nicht gesetzt`);
         }
       } else if (field === 'city_availability') {
         const hasAnyCity = Object.values(formData.city_availability).some(Boolean);
         if (!hasAnyCity) {
           missingFields.push(label as string);
           console.log(`[VALIDATION ERROR] Keine Stadt/Zone ausgewählt`);
         }
        } else if (field === 'is_last_mile_logistics' || field === 'works_for_quick_commerce' || field === 'works_for_gig_economy_food' || field === 'company_owns_vehicles' || field === 'operates_multiple_countries' || field === 'operates_multiple_cities') {
          // For boolean fields that start as null (UK specific), we need explicit selection
          if (field === 'company_owns_vehicles') {
           if (value === null) {
             missingFields.push(label as string);
              console.log(`[VALIDATION ERROR] Boolean-Feld "${field}" ist null (UK-spezifisch)`);
           }
         }
         // For works_for_quick_commerce and works_for_gig_economy_food in UK, they also need validation
         else if ((field === 'works_for_quick_commerce' || field === 'works_for_gig_economy_food') && (targetMarket === 'uk' || targetMarket === 'ireland')) {
           if (value === null) {
             missingFields.push(label as string);
             console.log(`[VALIDATION ERROR] UK/IE Boolean-Feld "${field}" ist null`);
           }
         }
         // For operates_multiple_countries and operates_multiple_cities, these are standard boolean fields with default false values - no validation needed
         else if (field === 'operates_multiple_countries' || field === 'operates_multiple_cities') {
           console.log(`[VALIDATION SKIP] Boolean-Feld "${field}" hat Standardwert (${value}), keine Validierung nötig`);
           // Skip validation for these standard boolean fields as they have default values
         }
         // For other boolean fields, we skip validation as they have default values
       } else if (field === 'last_mile_since_when') {
         // Special validation for experience year
         if (!value || (typeof value === 'string' && !value.trim())) {
           missingFields.push(label as string);
           console.log(`[VALIDATION ERROR] Jahresfeld "${field}" ist leer`);
         } else if (formData.company_established_year && parseInt(value as string) < formData.company_established_year) {
           missingFields.push(`${label as string} (darf nicht vor Gründungsjahr ${formData.company_established_year} liegen)`);
           console.log(`[VALIDATION ERROR] Jahr "${field}" (${value}) ist vor Gründungsjahr (${formData.company_established_year})`);
         }
       } else {
         if (!value || (typeof value === 'string' && !value.trim())) {
           missingFields.push(label as string);
           console.log(`[VALIDATION ERROR] Standardfeld "${field}" ist leer oder null`);
         }
       }
     });

     console.log(`[VALIDATION RESULT] Schritt ${step} - Fehlende Felder:`, missingFields);
     return missingFields;
   }, [formData, targetMarket]);

   const canProceedToNextStep = useMemo(() => {
     const missingFields = validateStepFields(currentStep);
     const canProceed = missingFields.length === 0;
     console.log(`[STEP VALIDATION] Schritt ${currentStep} - Kann fortfahren:`, canProceed);
     console.log(`[STEP VALIDATION] Schritt ${currentStep} - Fehlende Felder:`, missingFields);
     return canProceed;
   }, [validateStepFields, currentStep]);

  const handleNextStep = () => {
    const missingFields = validateStepFields(currentStep);
    
    if (missingFields.length > 0) {
      toast({
        title: 'Fehlende Pflichtfelder',
        description: `Bitte füllen Sie folgende Felder aus: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    if (currentStep < getTotalSteps()) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const hasFieldError = (fieldName: string) => {
    const missingFields = validateStepFields(currentStep);
    const requiredFields = getRequiredFieldsForStep(currentStep);
    const fieldLabel = requiredFields[fieldName];
    return fieldLabel && missingFields.includes(fieldLabel as string);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.company_name.trim() || !formData.email_address.trim()) {
      toast({
        title: t('common:messages.error'),
        description: t('forms:validation.required'),
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email_address)) {
      toast({
        title: t('common:messages.error'),
        description: t('forms:validation.email'),
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // Demo mode: Don't save to database, just show success
      if (contactId === "demo") {
        toast({
          title: t('forms:publicForm.success.title'),
          description: "Demo-Formular abgeschlossen (keine Daten gespeichert)",
        });
        setCurrentStep(5);
        setSaving(false);
        return;
      }

      // Prepare the form data for submission
      const submissionData = {
        ...formData,
        form_completed: true,
        form_completed_at: new Date().toISOString(),
        user_id: '00000000-0000-0000-0000-000000000000' // Anonymous user ID
      };

      let result;
      
      if (contactId) {
        // Update existing contact
        result = await supabase
          .from('contacts')
          .update(submissionData)
          .eq('id', contactId);
      } else {
        // Create new contact
        result = await supabase
          .from('contacts')
          .insert([submissionData])
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: t('forms:publicForm.success.title'),
        description: t('forms:publicForm.success.message'),
      });

      // Show success page and track conversion
      trackCompleteRegistration({
        content_name: `Partner Registration - ${formData.company_name}`,
        content_category: 'partner_registration',
        value: 1,
        market_type: formData.market_type,
        target_market: formData.target_market,
        company_name: formData.company_name
      });
      
      setCurrentStep(5);
    } catch (error: any) {
      toast({
        title: t('common:messages.error'),
        description: error.message || t('forms:validation.required'),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Get step title based on market type and step
  const getStepTitle = (step: number) => {
    if (marketType === 'bicycle_delivery') {
      switch (step) {
        case 1: return t('forms:publicForm.companyData.title');
        case 2: return t('forms:publicForm.logistics.title');
        case 3: return t('forms:publicForm.staffVehicles.title');
        case 4: return marketConfig?.zones ? t('forms:publicForm.cities.title').replace('Cities', 'Zones') : t('forms:publicForm.cities.title');
        default: return '';
      }
    } else {
      switch (step) {
        case 1: return t('forms:publicForm.companyData.title');
        case 2: return t('forms:publicForm.logistics.title');
        case 3: return t('forms:publicForm.staffVehicles.title');
        case 4: return t('forms:publicForm.cities.title');
        default: return '';
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>{t('common:messages.loading')}</p>
        </div>
      </div>
    );
  }

  // Only show error if marketConfig is missing (invalid market/region combo)
  if (!marketConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">{t('common:messages.error')}</h2>
            <p className="text-muted-foreground">Invalid market configuration: {marketType}/{targetMarket}</p>
            <Button 
              onClick={() => navigate('/')} 
              className="mt-4"
            >
              {t('common:buttons.backToHome')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success page
  if (currentStep === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-2xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-primary mb-4">{t('forms:publicForm.success.title')}</h2>
            <p className="text-lg text-muted-foreground mb-6">
              {t('forms:publicForm.success.message')}
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-primary">
                <strong>{t('common:buttons.next')}:</strong><br/>
                {t('forms:publicForm.success.message')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const IconComponent = getStepIcon(currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center bg-gradient-to-r from-primary to-primary/80 text-white rounded-t-lg p-4 sm:p-6">
            {contactId === "demo" && (
              <Badge variant="secondary" className="mb-2 bg-yellow-100 text-yellow-800 border-yellow-300">
                🔍 Demo-Modus - Daten werden nicht gespeichert
              </Badge>
            )}
            <CardTitle className="text-2xl sm:text-3xl text-white">
              {t('forms:publicForm.title')}
            </CardTitle>
            <p className="text-white/90 mt-2 text-base sm:text-lg break-words">
              {contact?.company_name || t('forms:publicForm.title')} - {marketType === 'bicycle_delivery' ? 'Bicycle Delivery' : 'Van/Transport'} - {targetMarket.toUpperCase()}
            </p>
            
            {/* Progress Bar */}
            <div className="mt-4 sm:mt-6">
              <div className="flex justify-between text-xs sm:text-sm text-white/80 mb-2">
                <span>{getStepTitle(currentStep)} {currentStep} / {getTotalSteps()}</span>
                <span>{getCurrentStepProgress()}% {t('common:buttons.complete')}</span>
              </div>
              <Progress value={getCurrentStepProgress()} className="h-1.5 sm:h-2" />
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-8">
            {/* Summary */}
            {showSummary ? (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-primary mb-4">{t('forms:publicForm.summary.reviewData')}</h3>
                
                {/* Company Data */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      {t('forms:publicForm.companyData.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>{t('forms:publicForm.companyData.companyName')}:</strong> {formData.company_name}</div>
                    <div><strong>{t('forms:publicForm.companyData.address')}:</strong> {formData.company_address}</div>
                    <div><strong>{t('forms:publicForm.companyData.website')}:</strong> {formData.website}</div>
                    <div><strong>{t('forms:publicForm.companyData.contactPerson')}:</strong> {formData.contact_person_first_name} {formData.contact_person_last_name}</div>
                    <div><strong>{t('forms:publicForm.companyData.phone')}:</strong> {formData.phone_number}</div>
                    <div><strong>{t('forms:publicForm.companyData.email')}:</strong> {formData.email_address}</div>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between pt-6 px-4 pb-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSummary(false)}
                    className="w-full sm:w-auto order-3 sm:order-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('common:buttons.back')}
                  </Button>
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-2 order-1 sm:order-2">
                    <Button 
                      variant="outline"
                      onClick={generatePDF}
                      className="w-full sm:w-auto h-11"
                    >
                      {t('forms:publicForm.logistics.downloadPdf')}
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={saving}
                      className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto h-11"
                    >
                      {saving ? t('common:buttons.loading') : t('forms:publicForm.summary.submitForm')}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                 {/* Step 1: Company Data */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <IconComponent className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-primary">{getStepTitle(1)}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{t('forms:publicForm.requiredFieldsNotice')}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company_name" className={hasFieldError('company_name') ? 'text-destructive' : ''}>
                          {t('forms:publicForm.companyData.companyName')} *
                        </Label>
                        <Input
                          id="company_name"
                          value={formData.company_name}
                          onChange={(e) => updateFormData('company_name', e.target.value)}
                          className={hasFieldError('company_name') ? 'border-destructive focus:border-destructive' : ''}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email_address" className={hasFieldError('email_address') ? 'text-destructive' : ''}>
                          {t('forms:publicForm.companyData.email')} *
                        </Label>
                        <Input
                          id="email_address"
                          type="email"
                          value={formData.email_address}
                          onChange={(e) => updateFormData('email_address', e.target.value)}
                          className={hasFieldError('email_address') ? 'border-destructive focus:border-destructive' : ''}
                          required
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="company_address" className={hasFieldError('company_address') ? 'text-destructive' : ''}>
                          {t('forms:publicForm.companyData.address')} *
                        </Label>
                        <Textarea
                          id="company_address"
                          value={formData.company_address}
                          onChange={(e) => updateFormData('company_address', e.target.value)}
                          className={hasFieldError('company_address') ? 'border-destructive focus:border-destructive' : ''}
                          rows={3}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website" className={hasFieldError('website') ? 'text-destructive' : ''}>
                          {t('forms:publicForm.companyData.website')} *
                        </Label>
                        <Input
                          id="website"
                          type="url"
                          value={formData.website}
                          onChange={(e) => updateFormData('website', e.target.value)}
                          className={hasFieldError('website') ? 'border-destructive focus:border-destructive' : ''}
                          placeholder="https://..."
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact_person_first_name" className={hasFieldError('contact_person_first_name') ? 'text-destructive' : ''}>
                          {t('forms:publicForm.companyData.contactPerson')} *
                        </Label>
                        <Input
                          id="contact_person_first_name"
                          value={formData.contact_person_first_name}
                          onChange={(e) => updateFormData('contact_person_first_name', e.target.value)}
                          className={hasFieldError('contact_person_first_name') ? 'border-destructive focus:border-destructive' : ''}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone_number" className={hasFieldError('phone_number') ? 'text-destructive' : ''}>
                          {t('forms:publicForm.companyData.phone')} *
                        </Label>
                        <Input
                          id="phone_number"
                          value={formData.phone_number}
                          onChange={(e) => updateFormData('phone_number', e.target.value)}
                          className={hasFieldError('phone_number') ? 'border-destructive focus:border-destructive' : ''}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                 {/* Step 2: Experience/Logistics */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <IconComponent className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-primary">{getStepTitle(2)}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{t('forms:publicForm.requiredFieldsNotice')}</p>
                    </div>

                    <div className="space-y-6">
                      {/* Company & Experience Information - Combined Section */}
                      <div className="space-y-6 p-4 border border-border rounded-lg bg-card/50">
                        <h4 className="text-lg font-medium text-foreground">{t('forms:publicForm.logistics.companyExperienceSection')}</h4>
                        
                        {/* Company Establishment Year */}
                        <div className="space-y-2">
                          <Label htmlFor="company_established_year" className={hasFieldError('company_established_year') ? 'text-destructive' : ''}>
                            {t('forms:publicForm.logistics.companyEstablishedYear')} *
                          </Label>
                          <Input
                            id="company_established_year"
                            type="number"
                            min="1900"
                            max={new Date().getFullYear()}
                            value={formData.company_established_year || ''}
                            onChange={(e) => updateFormData('company_established_year', parseInt(e.target.value) || null)}
                            className={hasFieldError('company_established_year') ? 'border-destructive focus:border-destructive' : ''}
                            placeholder="e.g., 2020"
                            required
                          />
                        </div>

                        {/* Experience Question */}
                        <div className="space-y-4">
                          <Label className={hasFieldError('is_last_mile_logistics') ? 'text-destructive' : ''}>
                            {t('forms:publicForm.logistics.logisticsExperience')} *
                          </Label>
                          <RadioGroup
                            value={formData.is_last_mile_logistics ? 'yes' : 'no'}
                            onValueChange={(value) => updateFormData('is_last_mile_logistics', value === 'yes')}
                            required
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="experience_yes" />
                              <Label htmlFor="experience_yes">{t('common:buttons.yes')}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="experience_no" />
                              <Label htmlFor="experience_no">{t('common:buttons.no')}</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Experience Since Year - Only if they have experience */}
                        {formData.is_last_mile_logistics && (
                          <div className="space-y-2">
                            <Label htmlFor="since_when" className={hasFieldError('last_mile_since_when') ? 'text-destructive' : ''}>
                              {t('forms:publicForm.logistics.experienceSinceYear')} *
                            </Label>
                            <Input
                              id="since_when"
                              type="number"
                              min={formData.company_established_year || 1900}
                              max={new Date().getFullYear()}
                              value={formData.last_mile_since_when}
                              onChange={(e) => updateFormData('last_mile_since_when', e.target.value)}
                              className={hasFieldError('last_mile_since_when') ? 'border-destructive focus:border-destructive' : ''}
                              placeholder="e.g., 2021"
                              required
                            />
                            {formData.company_established_year && (
                              <p className="text-sm text-muted-foreground">
                                {t('forms:publicForm.logistics.experienceValidationHint', { year: formData.company_established_year })}
                              </p>
                            )}
                          </div>
                        )}
                      </div>


                      {/* Bicycle-specific questions */}
                      {marketType === 'bicycle_delivery' && (
                        <>
                          <div className="space-y-4">
                            <Label className={hasFieldError('works_for_gig_economy_food') ? 'text-destructive' : ''}>
                              {t('forms:publicForm.logistics.worksForGigEconomyFood')} *
                            </Label>
                            <RadioGroup
                              value={formData.works_for_gig_economy_food ? 'yes' : 'no'}
                              onValueChange={(value) => updateFormData('works_for_gig_economy_food', value === 'yes')}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="gig_food_yes" />
                                <Label htmlFor="gig_food_yes">{t('common:buttons.yes')}</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="gig_food_no" />
                                <Label htmlFor="gig_food_no">{t('common:buttons.no')}</Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {formData.works_for_gig_economy_food && (
                            <div className="space-y-3">
                              <Label>{t('forms:publicForm.logistics.gigEconomyCompaniesSelect')}</Label>
                              <div className="grid grid-cols-2 gap-2">
                                {['uberEats', 'deliveroo', 'justEat', 'dpd', 'yodel', 'glovo'].map((company) => (
                                  <div key={company} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`gig_${company}`}
                                      checked={formData.gig_economy_companies?.includes(company) || false}
                                      onCheckedChange={(checked) => {
                                        const current = formData.gig_economy_companies || [];
                                        if (checked) {
                                          updateFormData('gig_economy_companies', [...current, company]);
                                        } else {
                                          updateFormData('gig_economy_companies', current.filter(c => c !== company));
                                        }
                                      }}
                                    />
                                    <Label htmlFor={`gig_${company}`}>{t(`forms:gigEconomyCompanies.${company}`)}</Label>
                                  </div>
                                ))}
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="gig_other"
                                    checked={formData.gig_economy_companies?.includes('other') || false}
                                    onCheckedChange={(checked) => {
                                      const current = formData.gig_economy_companies || [];
                                      if (checked) {
                                        updateFormData('gig_economy_companies', [...current, 'other']);
                                      } else {
                                        updateFormData('gig_economy_companies', current.filter(c => c !== 'other'));
                                        updateFormData('gig_economy_other', '');
                                      }
                                    }}
                                  />
                                  <Label htmlFor="gig_other">{t('forms:gigEconomyCompanies.other')}</Label>
                                </div>
                              </div>
                              {formData.gig_economy_companies?.includes('other') && (
                                <Input
                                  placeholder={t('forms:publicForm.logistics.otherGigEconomyCompany')}
                                  value={formData.gig_economy_other || ''}
                                  onChange={(e) => updateFormData('gig_economy_other', e.target.value)}
                                />
                              )}
                            </div>
                          )}

                          <div className="space-y-4">
                            <Label className={hasFieldError('works_for_quick_commerce') ? 'text-destructive' : ''}>
                              {t('forms:publicForm.logistics.worksForQuickCommerce')} *
                            </Label>
                            <RadioGroup
                              value={formData.works_for_quick_commerce ? 'yes' : 'no'}
                              onValueChange={(value) => updateFormData('works_for_quick_commerce', value === 'yes')}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="quick_commerce_yes" />
                                <Label htmlFor="quick_commerce_yes">{t('common:buttons.yes')}</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="quick_commerce_no" />
                                <Label htmlFor="quick_commerce_no">{t('common:buttons.no')}</Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {formData.works_for_quick_commerce && (
                            <div className="space-y-3">
                              <Label>{t('forms:publicForm.logistics.quickCommerceCompaniesSelect')}</Label>
                              <div className="grid grid-cols-2 gap-2">
                                {['getir', 'gorillas', 'zapp'].map((company) => (
                                  <div key={company} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`quick_${company}`}
                                      checked={formData.quick_commerce_companies?.includes(company) || false}
                                      onCheckedChange={(checked) => {
                                        const current = formData.quick_commerce_companies || [];
                                        if (checked) {
                                          updateFormData('quick_commerce_companies', [...current, company]);
                                        } else {
                                          updateFormData('quick_commerce_companies', current.filter(c => c !== company));
                                        }
                                      }}
                                    />
                                    <Label htmlFor={`quick_${company}`}>{t(`forms:quickCommerceCompanies.${company}`)}</Label>
                                  </div>
                                ))}
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="quick_other"
                                    checked={formData.quick_commerce_companies?.includes('other') || false}
                                    onCheckedChange={(checked) => {
                                      const current = formData.quick_commerce_companies || [];
                                      if (checked) {
                                        updateFormData('quick_commerce_companies', [...current, 'other']);
                                      } else {
                                        updateFormData('quick_commerce_companies', current.filter(c => c !== 'other'));
                                        updateFormData('quick_commerce_other', '');
                                      }
                                    }}
                                  />
                                  <Label htmlFor="quick_other">{t('forms:quickCommerceCompanies.other')}</Label>
                                </div>
                              </div>
                              {formData.quick_commerce_companies?.includes('other') && (
                                <Input
                                  placeholder={t('forms:publicForm.logistics.otherQuickCommerceCompany')}
                                  value={formData.quick_commerce_other || ''}
                                  onChange={(e) => updateFormData('quick_commerce_other', e.target.value)}
                                />
                              )}
                            </div>
                          )}


                          <div className="space-y-4">
                            <Label>{targetMarket === 'uk' || targetMarket === 'ireland' ? t('forms:publicForm.logistics.companyOwnsVehiclesUkIreland') : t('forms:publicForm.logistics.companyOwnsVehicles')}</Label>
                            <RadioGroup
                              value={formData.company_owns_vehicles ? 'yes' : 'no'}
                              onValueChange={(value) => updateFormData('company_owns_vehicles', value === 'yes')}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="owns_vehicles_yes" />
                                <Label htmlFor="owns_vehicles_yes">{t('common:buttons.yes')}</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="owns_vehicles_no" />
                                <Label htmlFor="owns_vehicles_no">{t('common:buttons.no')}</Label>
                              </div>
                            </RadioGroup>
                          </div>

                          <div className="space-y-4">
                            <Label>{t('forms:publicForm.logistics.usesCargobikes')}</Label>
                            <RadioGroup
                              value={formData.uses_cargo_bikes ? 'yes' : 'no'}
                              onValueChange={(value) => updateFormData('uses_cargo_bikes', value === 'yes')}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="cargo_bikes_yes" />
                                <Label htmlFor="cargo_bikes_yes">{t('common:buttons.yes')}</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="cargo_bikes_no" />
                                <Label htmlFor="cargo_bikes_no">{t('common:buttons.no')}</Label>
                              </div>
                            </RadioGroup>
                          </div>



                          <div className="space-y-2">
                            <Label htmlFor="amazon_work_capacity">{t('forms:publicForm.logistics.amazonWorkCapacity')} *</Label>
                            <Textarea
                              id="amazon_work_capacity"
                              value={formData.amazon_work_capacity || ''}
                              onChange={(e) => updateFormData('amazon_work_capacity', e.target.value)}
                              placeholder={t("forms:publicForm.amazonExperiencePlaceholder")}
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="bicycle_count">{t('forms:publicForm.logistics.bicycleCount')} *</Label>
                              <Input
                                id="bicycle_count"
                                type="number"
                                min="0"
                                value={formData.bicycle_count || ''}
                                onChange={(e) => updateFormData('bicycle_count', parseInt(e.target.value) || null)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="cargo_bike_count">{t('forms:publicForm.logistics.cargoBikeCount')} *</Label>
                              <Input
                                id="cargo_bike_count"
                                type="number"
                                min="0"
                                value={formData.cargo_bike_count || ''}
                                onChange={(e) => updateFormData('cargo_bike_count', parseInt(e.target.value) || null)}
                              />
                            </div>


                          </div>

                          <div className="space-y-4">
                            <Label>{t('forms:publicForm.logistics.operatesMultipleCountries')} *</Label>
                            <RadioGroup
                              value={formData.operates_multiple_countries ? 'yes' : 'no'}
                              onValueChange={(value) => updateFormData('operates_multiple_countries', value === 'yes')}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="multiple_countries_yes" />
                                <Label htmlFor="multiple_countries_yes">{t('common:buttons.yes')}</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="multiple_countries_no" />
                                <Label htmlFor="multiple_countries_no">{t('common:buttons.no')}</Label>
                              </div>
                            </RadioGroup>
                          </div>

                          <div className="space-y-4">
                            <Label>{t('forms:publicForm.logistics.operatesMultipleCities')} *</Label>
                            <RadioGroup
                              value={formData.operates_multiple_cities ? 'yes' : 'no'}
                              onValueChange={(value) => updateFormData('operates_multiple_cities', value === 'yes')}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="multiple_cities_yes" />
                                <Label htmlFor="multiple_cities_yes">{t('common:buttons.yes')}</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="multiple_cities_no" />
                                <Label htmlFor="multiple_cities_no">{t('common:buttons.no')}</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </>
                      )}

                      {/* UK/Ireland van_transport specific questions */}
                      {marketType === 'van_transport' && (targetMarket === 'uk' || targetMarket === 'ireland') && (
                        <>

                          <div className="space-y-2">
                            <Label htmlFor="uk_legal_status" className={hasFieldError('legal_form') ? 'text-destructive' : ''}>{t('forms:publicForm.logistics.legalStatus')} *</Label>
                            <Input
                              id="uk_legal_status"
                              value={formData.legal_form || ''}
                              onChange={(e) => updateFormData('legal_form', e.target.value)}
                              placeholder={t("forms:publicForm.legalStatusPlaceholder")}
                            />
                          </div>

                          {/* Vehicle Information */}
                          <div className="space-y-4">
                            <fieldset>
                              <legend className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${hasFieldError('vehicle_types') ? 'text-destructive' : ''}`}>
                                {t('forms:publicForm.staffVehicles.vehicleTypes')} *
                              </legend>
                            {hasFieldError('vehicle_types') && (
                              <p className="text-sm text-destructive">{t('forms:validation.selectAtLeastOneVehicleType')}</p>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                              {marketConfig.vehicleTypes.map((type) => (
                                <div key={type} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`vehicle_${type}`}
                                    checked={formData.vehicle_types.includes(type)}
                                    onCheckedChange={() => toggleArrayItem('vehicle_types', type)}
                                  />
                                  <Label htmlFor={`vehicle_${type}`} className="text-sm">{type}</Label>
                                </div>
                               ))}
                             </div>
                            </fieldset>
                           </div>

                          <div className="space-y-2">
                            <Label htmlFor="vehicle_count">{t('forms:publicForm.staffVehicles.vehicleCount')} *</Label>
                            <Input
                              id="vehicle_count"
                              type="number"
                              min="0"
                              value={formData.total_vehicle_count || ''}
                              onChange={(e) => updateFormData('total_vehicle_count', parseInt(e.target.value) || null)}
                              required
                            />
                          </div>

                          <div className="space-y-4">
                            <Label htmlFor="company_owns_vehicles_group" className={hasFieldError('company_owns_vehicles') ? 'text-destructive' : ''}>{targetMarket === 'uk' || targetMarket === 'ireland' ? t('forms:publicForm.logistics.companyOwnsVehiclesUkIreland') : t('forms:publicForm.logistics.companyOwnsVehicles')} *</Label>
                            <RadioGroup
                              id="company_owns_vehicles_group"
                              value={formData.company_owns_vehicles === null ? '' : formData.company_owns_vehicles ? 'yes' : 'no'}
                              onValueChange={(value) => updateFormData('company_owns_vehicles', value === 'yes')}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="uk_owns_vehicles_yes" />
                                <Label htmlFor="uk_owns_vehicles_yes">{t('common:buttons.yes')}</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="uk_owns_vehicles_no" />
                                <Label htmlFor="uk_owns_vehicles_no">{t('common:buttons.no')}</Label>
                              </div>
                            </RadioGroup>
                          </div>


                          <div className="space-y-2">
                            <Label htmlFor="uk_amazon_work_capacity" className={hasFieldError('amazon_work_capacity') ? 'text-destructive' : ''}>{t('forms:publicForm.logistics.amazonWorkCapacity')} *</Label>
                            <Textarea
                              id="uk_amazon_work_capacity"
                              value={formData.amazon_work_capacity || ''}
                              onChange={(e) => updateFormData('amazon_work_capacity', e.target.value)}
                              placeholder={t("forms:publicForm.amazonExperiencePlaceholder")}
                              rows={3}
                            />
                          </div>

                          <div className="space-y-4">
                            <Label htmlFor="works_for_gig_economy_food_group" className={hasFieldError('works_for_gig_economy_food') ? 'text-destructive' : ''}>{t('forms:publicForm.logistics.worksForGigEconomyFood')} *</Label>
                            <RadioGroup
                              id="works_for_gig_economy_food_group"
                              value={formData.works_for_gig_economy_food === null ? '' : formData.works_for_gig_economy_food ? 'yes' : 'no'}
                              onValueChange={(value) => updateFormData('works_for_gig_economy_food', value === 'yes')}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="uk_gig_food_yes" />
                                <Label htmlFor="uk_gig_food_yes">{t('common:buttons.yes')}</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="uk_gig_food_no" />
                                <Label htmlFor="uk_gig_food_no">{t('common:buttons.no')}</Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {formData.works_for_gig_economy_food === true && (
                            <div className="space-y-3">
                              <Label>{t('forms:publicForm.logistics.gigEconomyCompaniesSelect')}</Label>
                              <div className="grid grid-cols-2 gap-2">
                                {['uberEats', 'deliveroo', 'justEat', 'dpd', 'yodel', 'glovo'].map((company) => (
                                  <div key={company} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`uk_gig_${company}`}
                                      checked={formData.gig_economy_companies?.includes(company) || false}
                                      onCheckedChange={(checked) => {
                                        const current = formData.gig_economy_companies || [];
                                        if (checked) {
                                          updateFormData('gig_economy_companies', [...current, company]);
                                        } else {
                                          updateFormData('gig_economy_companies', current.filter(c => c !== company));
                                        }
                                      }}
                                    />
                                    <Label htmlFor={`uk_gig_${company}`}>{t(`forms:gigEconomyCompanies.${company}`)}</Label>
                                  </div>
                                ))}
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="uk_gig_other"
                                    checked={formData.gig_economy_companies?.includes('other') || false}
                                    onCheckedChange={(checked) => {
                                      const current = formData.gig_economy_companies || [];
                                      if (checked) {
                                        updateFormData('gig_economy_companies', [...current, 'other']);
                                      } else {
                                        updateFormData('gig_economy_companies', current.filter(c => c !== 'other'));
                                        updateFormData('gig_economy_other', '');
                                      }
                                    }}
                                  />
                                  <Label htmlFor="uk_gig_other">{t('forms:gigEconomyCompanies.other')}</Label>
                                </div>
                              </div>
                              {formData.gig_economy_companies?.includes('other') && (
                                <Input
                                  placeholder={t('forms:publicForm.logistics.otherGigEconomyCompany')}
                                  value={formData.gig_economy_other || ''}
                                  onChange={(e) => updateFormData('gig_economy_other', e.target.value)}
                                />
                              )}
                            </div>
                          )}

                          <div className="space-y-4">
                            <Label htmlFor="works_for_quick_commerce_group" className={hasFieldError('works_for_quick_commerce') ? 'text-destructive' : ''}>{t('forms:publicForm.logistics.worksForQuickCommerce')} *</Label>
                            <RadioGroup
                              id="works_for_quick_commerce_group"
                              value={formData.works_for_quick_commerce === null ? '' : formData.works_for_quick_commerce ? 'yes' : 'no'}
                              onValueChange={(value) => updateFormData('works_for_quick_commerce', value === 'yes')}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="uk_quick_commerce_yes" />
                                <Label htmlFor="uk_quick_commerce_yes">{t('common:buttons.yes')}</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="uk_quick_commerce_no" />
                                <Label htmlFor="uk_quick_commerce_no">{t('common:buttons.no')}</Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {formData.works_for_quick_commerce === true && (
                            <div className="space-y-3">
                              <Label>{t('forms:publicForm.logistics.quickCommerceCompaniesSelect')}</Label>
                              <div className="grid grid-cols-2 gap-2">
                                {['getir', 'gorillas', 'zapp'].map((company) => (
                                  <div key={company} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`uk_quick_${company}`}
                                      checked={formData.quick_commerce_companies?.includes(company) || false}
                                      onCheckedChange={(checked) => {
                                        const current = formData.quick_commerce_companies || [];
                                        if (checked) {
                                          updateFormData('quick_commerce_companies', [...current, company]);
                                        } else {
                                          updateFormData('quick_commerce_companies', current.filter(c => c !== company));
                                        }
                                      }}
                                    />
                                    <Label htmlFor={`uk_quick_${company}`}>{t(`forms:quickCommerceCompanies.${company}`)}</Label>
                                  </div>
                                ))}
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="uk_quick_other"
                                    checked={formData.quick_commerce_companies?.includes('other') || false}
                                    onCheckedChange={(checked) => {
                                      const current = formData.quick_commerce_companies || [];
                                      if (checked) {
                                        updateFormData('quick_commerce_companies', [...current, 'other']);
                                      } else {
                                        updateFormData('quick_commerce_companies', current.filter(c => c !== 'other'));
                                        updateFormData('quick_commerce_other', '');
                                      }
                                    }}
                                  />
                                  <Label htmlFor="uk_quick_other">{t('forms:quickCommerceCompanies.other')}</Label>
                                </div>
                              </div>
                              {formData.quick_commerce_companies?.includes('other') && (
                                <Input
                                  placeholder={t('forms:publicForm.logistics.otherQuickCommerceCompany')}
                                  value={formData.quick_commerce_other || ''}
                                  onChange={(e) => updateFormData('quick_commerce_other', e.target.value)}
                                />
                              )}
                            </div>
                          )}

                        </>
                      )}
                    </div>
                  </div>
                )}

                 {/* Step 3: Staff */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <IconComponent className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-primary">{getStepTitle(3)}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{t('forms:publicForm.requiredFieldsNotice')}</p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <fieldset>
                          <legend className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${hasFieldError('staff_types') ? 'text-destructive' : ''}`}>
                            {marketType === 'bicycle_delivery' ? t('forms:publicForm.ridersTypes') : t('forms:publicForm.staffVehicles.staffTypes')} *
                          </legend>
                        {hasFieldError('staff_types') && (
                          <p className="text-sm text-destructive">{t('forms:validation.selectAtLeastOneStaffType')}</p>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          {marketConfig.staffTypes.map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                id={`staff_${type}`}
                                checked={formData.staff_types.includes(type)}
                                onCheckedChange={() => toggleArrayItem('staff_types', type)}
                              />
                              <Label htmlFor={`staff_${type}`} className="text-sm">{type}</Label>
                            </div>
                          ))}
                        </div>
                        </fieldset>
                      </div>

                        {/* Employee/Staff questions moved from Step 2 */}
                        {marketType === 'van_transport' && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="delivery_driver_count">{t('forms:publicForm.logistics.deliveryDriverCount')} *</Label>
                              <Input
                                id="delivery_driver_count"
                                type="number"
                                min="0"
                                value={formData.delivery_driver_count || ''}
                                onChange={(e) => updateFormData('delivery_driver_count', parseInt(e.target.value) || null)}
                              />
                            </div>
                          </>
                        )}

                       {marketType === 'bicycle_delivery' && (
                         <>
                           <div className="space-y-2">
                             <Label htmlFor="delivery_driver_count">{t('forms:publicForm.logistics.deliveryDriverCount')} *</Label>
                             <Input
                               id="delivery_driver_count"
                               type="number"
                               min="0"
                               value={formData.delivery_driver_count || ''}
                               onChange={(e) => updateFormData('delivery_driver_count', parseInt(e.target.value) || null)}
                             />
                           </div>

                           <div className="space-y-2">
                             <Label htmlFor="bicycle_driver_count">{t('forms:publicForm.logistics.bicycleDriverCount')} *</Label>
                             <Input
                               id="bicycle_driver_count"
                               type="number"
                               min="0"
                               value={formData.bicycle_driver_count || ''}
                               onChange={(e) => updateFormData('bicycle_driver_count', parseInt(e.target.value) || null)}
                             />
                           </div>
                         </>
                       )}
                    </div>
                  </div>
                )}

                 {/* Step 4: Location Availability */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <IconComponent className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-primary">{getStepTitle(4)}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{t('forms:publicForm.requiredFieldsNotice')}</p>
                      <p className="text-muted-foreground">
                        {marketConfig.zones 
                          ? t('forms:publicForm.logistics.selectZonesInstruction')
                          : t('forms:publicForm.cities.description')
                        }
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Label className={`text-base font-medium ${hasFieldError('city_availability') ? 'text-destructive' : ''}`}>
                        {marketConfig.zones 
                          ? t('forms:publicForm.logistics.selectZonesInstruction')
                          : t('forms:publicForm.cities.description')
                        } *
                      </Label>
                      {hasFieldError('city_availability') && (
                        <p className="text-sm text-destructive">
                          {t('forms:validation.selectAtLeastOneLocation', { location: marketConfig.zones ? 'Zone' : 'Stadt' })}
                        </p>
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {(marketConfig.zones || marketConfig.cities || []).map((location) => (
                          <div key={location} className="flex items-center space-x-2">
                            <Checkbox
                              id={`location_${location}`}
                              checked={formData.city_availability[location] || false}
                              onCheckedChange={() => toggleLocationAvailability(location)}
                            />
                            <Label htmlFor={`location_${location}`} className="text-sm">{location}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additional_comments">{t('forms:contactForm.fields.notes')}</Label>
                      <Textarea
                        id="additional_comments"
                        value={formData.additional_comments}
                        onChange={(e) => updateFormData('additional_comments', e.target.value)}
                        rows={4}
                        placeholder={t("forms:publicForm.logistics.additionalComments")}
                      />
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between pt-6 px-4 pb-4">
                  {currentStep > 1 ? (
                    <Button 
                      variant="outline" 
                      onClick={handlePreviousStep}
                      className="w-full sm:w-auto order-2 sm:order-1 h-11"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {t('common:buttons.back')}
                    </Button>
                  ) : <div className="hidden sm:block" />}
                  
                  {currentStep < getTotalSteps() ? (
                    <Button 
                      onClick={handleNextStep}
                      disabled={!canProceedToNextStep}
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto order-1 sm:order-2 h-11"
                    >
                      {t('common:buttons.next')}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => {
                        const missingFields = validateStepFields(currentStep);
                        if (missingFields.length > 0) {
                          toast({
                            title: 'Fehlende Pflichtfelder',
                            description: `Bitte füllen Sie folgende Felder aus: ${missingFields.join(', ')}`,
                            variant: "destructive",
                          });
                          return;
                        }
                        setShowSummary(true);
                      }}
                      disabled={!canProceedToNextStep}
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto order-1 sm:order-2 h-11"
                    >
                      {t('forms:publicForm.summary.reviewData')}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Meta Pixel Script */}
      {metaPixelCode && (
        <div dangerouslySetInnerHTML={{ __html: metaPixelCode }} />
      )}
    </div>
  );
};

export default DynamicPublicForm;