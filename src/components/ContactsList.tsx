import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContactsFilter, ContactFilters } from "./ContactsFilter";
import { EditContact } from "./EditContact";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import * as XLSX from 'xlsx';
import { 
  Eye, Mail, CheckCircle, XCircle, ArrowRight, Building, User, 
  Phone, Globe, MapPin, Truck, Users, Package, Edit, Trash2, Download, MessageCircle
} from "lucide-react";

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
  // Market fields
  market_type?: string;
  target_market?: string;
  // Logistics fields
  is_last_mile_logistics?: boolean;
  last_mile_since_when?: string;
  operating_cities?: string[] | string;
  food_delivery_services?: boolean;
  food_delivery_platforms?: string[];
  staff_types?: string[];
  full_time_drivers?: number;
  delivery_driver_count?: number;
  vehicle_types?: string[];
  transporter_count?: number;
  total_vehicle_count?: number;
  amazon_experience?: boolean;
  city_availability?: any;
  additional_comments?: string;
  // Bicycle delivery fields
  company_owns_vehicles?: boolean;
  uses_cargo_bikes?: boolean;
  bicycle_count?: number;
  cargo_bike_count?: number;
  bicycle_driver_count?: number;
  // Missing export fields
  quick_commerce_companies?: string[];
  employee_type?: string;
  employment_status?: string;
  gig_economy_companies?: string[];
  gig_economy_other?: string;
  works_for_gig_economy_food?: boolean;
  // Email tracking fields
  email_delivered?: boolean;
  email_opened?: boolean;
  email_clicked?: boolean;
  // Comment flag
  has_comments?: boolean;
}

interface ContactsListProps {
  contacts: Contact[];
  onContactsChange: () => void;
}

export const ContactsList = ({ contacts, onContactsChange }: ContactsListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ContactFilters>({
    searchTerm: "",
    emailStatus: "all",
    formStatus: "all",
    legalForm: "all",
    marketType: "all",
    targetMarket: "all",
    isLastMileLogistics: "all",
    foodDeliveryServices: "all",
    amazonExperience: "all",
    emailDelivered: "all",
    emailOpened: "all",
    emailClicked: "all",
    profileCompleted: "all",
    operatingCities: [],
    availableCities: [],
    vehicleTypes: [],
    staffTypes: [],
    foodPlatforms: [],
    minDrivers: "",
    maxDrivers: "",
    minTransporters: "",
    maxTransporters: "",
    lastMileSince: ""
  });

  const itemsPerPage = 25;


  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleDeleteContact = async (contactId: string, companyName: string) => {
    if (!confirm(t('common:messages.confirmDelete'))) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) {
        throw error;
      }

      toast({
        title: t('common:messages.success'),
        description: t('contacts:details.deleteButton'),
      });

      onContactsChange();
    } catch (error: any) {
      toast({
        title: t('common:messages.error'),
        description: error.message || t('common:messages.error'),
        variant: "destructive",
      });
    }
  };

  const handleExportContacts = (format: 'xlsx' | 'csv') => {
    if (filteredContacts.length === 0) {
      toast({
        title: t('common:messages.error'),
        description: t('contacts:list.export.noContacts'),
        variant: "destructive",
      });
      return;
    }

    // Prepare data for export with all fields
    const exportData = filteredContacts.map(contact => ({
      [t('contacts:list.columns.name')]: contact.company_name,
      [t('contacts:list.columns.email')]: contact.email_address,
      [t('contacts:list.export.firstName')]: contact.contact_person_first_name || '',
      [t('contacts:list.export.lastName')]: contact.contact_person_last_name || '',
      [t('contacts:list.columns.position')]: contact.contact_person_position || '',
      [t('contacts:list.columns.phone')]: contact.phone_number || '',
      [t('contacts:list.export.companyAddress')]: contact.company_address || '',
      [t('contacts:list.export.legalForm')]: contact.legal_form || '',
      [t('contacts:list.export.website')]: contact.website || '',
      [t('contacts:list.export.emailSent')]: contact.email_sent ? t('contacts:list.experienceOptions.yes') : t('contacts:list.experienceOptions.no'),
      [t('contacts:list.export.formCompleted')]: contact.form_completed ? t('contacts:list.experienceOptions.yes') : t('contacts:list.experienceOptions.no'),
      [t('contacts:list.export.emailDelivered')]: contact.email_delivered ? t('contacts:list.experienceOptions.yes') : t('contacts:list.experienceOptions.no'),
      [t('contacts:list.export.emailOpened')]: contact.email_opened ? t('contacts:list.experienceOptions.yes') : t('contacts:list.experienceOptions.no'),
      [t('contacts:list.export.emailClicked')]: contact.email_clicked ? t('contacts:list.experienceOptions.yes') : t('contacts:list.experienceOptions.no'),
      [t('contacts:list.export.lastMileLogistics')]: contact.is_last_mile_logistics ? t('contacts:list.experienceOptions.yes') : t('contacts:list.experienceOptions.no'),
      [t('contacts:list.export.lastMileSince')]: contact.last_mile_since_when || '',
      [t('contacts:list.export.foodDeliveryServices')]: contact.food_delivery_services ? t('contacts:list.experienceOptions.yes') : t('contacts:list.experienceOptions.no'),
      [t('contacts:list.columns.experience')]: contact.amazon_experience ? t('contacts:list.experienceOptions.yes') : t('contacts:list.experienceOptions.no'),
      [t('contacts:list.export.fullTimeDrivers')]: contact.delivery_driver_count || 0,
      [t('contacts:list.export.transporterCount')]: contact.total_vehicle_count || 0,
      [t('contacts:list.export.operatingCities')]: Array.isArray(contact.operating_cities) 
        ? contact.operating_cities.join(', ')
        : contact.operating_cities || '',
      [t('contacts:list.export.availableCities')]: contact.city_availability 
        ? Object.entries(contact.city_availability)
            .filter(([_, available]) => available === true)
            .map(([city, _]) => city)
            .join(', ')
        : '',
      [t('contacts:list.export.vehicleTypes')]: (contact.vehicle_types || []).join(', '),
      [t('contacts:list.export.staffTypes')]: (contact.staff_types || []).join(', '),
      [t('contacts:list.export.foodDeliveryPlatforms')]: (contact.food_delivery_platforms || []).join(', '),
      // Bicycle delivery specific fields
      [t('contacts:list.export.companyOwnsVehicles')]: contact.company_owns_vehicles ? t('contacts:list.experienceOptions.yes') : t('contacts:list.experienceOptions.no'),
      [t('contacts:list.export.usesCargoBikes')]: contact.uses_cargo_bikes ? t('contacts:list.experienceOptions.yes') : t('contacts:list.experienceOptions.no'),
      [t('contacts:list.export.bicycleCount')]: contact.bicycle_count || 0,
      [t('contacts:list.export.cargoBikeCount')]: contact.cargo_bike_count || 0,
      [t('contacts:list.export.bicycleDriverCount')]: contact.bicycle_driver_count || 0,
      [t('contacts:list.export.gigEconomyCompanies')]: (contact.gig_economy_companies || []).join(', '),
      [t('contacts:list.export.gigEconomyOther')]: contact.gig_economy_other || '',
      [t('contacts:list.export.worksForGigEconomyFood')]: contact.works_for_gig_economy_food ? t('contacts:common.yes') : t('contacts:common.no'),
      [t('contacts:list.export.quickCommerceCompanies')]: (contact.quick_commerce_companies || []).join(', '),
      [t('contacts:list.export.employeeType')]: contact.employee_type || '',
      [t('contacts:list.export.employmentStatus')]: contact.employment_status || '',
      [t('contacts:list.export.additionalComments')]: contact.additional_comments || '',
      [t('contacts:list.export.createdAt')]: new Date(contact.created_at).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t('contacts:list.title'));

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${t('contacts:list.export.filename')}_${timestamp}.${format}`;

    if (format === 'xlsx') {
      XLSX.writeFile(wb, filename);
    } else {
      XLSX.writeFile(wb, filename, { bookType: 'csv' });
    }

    toast({
      title: t('common:messages.success'),
      description: t('contacts:list.export.success', { count: filteredContacts.length }),
    });
  };

  const { filteredContacts, activeFiltersCount, paginatedContacts, totalPages, startItem, endItem } = useMemo(() => {
    let filtered = contacts.filter(contact => {
      // Search term
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchFields = [
          contact.company_name,
          contact.email_address,
          contact.contact_person_first_name,
          contact.contact_person_last_name,
          contact.company_address,
          contact.legal_form,
          contact.website,
          contact.contact_person_position,
          contact.phone_number,
          contact.last_mile_since_when,
          ...(Array.isArray(contact.operating_cities) ? contact.operating_cities : 
              contact.operating_cities ? [contact.operating_cities] : []),
          ...(contact.food_delivery_platforms || []),
          ...(contact.staff_types || []),
          ...(contact.vehicle_types || [])
        ].filter(Boolean);
        
        if (!searchFields.some(field => 
          field?.toString().toLowerCase().includes(searchLower)
        )) {
          return false;
        }
      }

      // Email status
      if (filters.emailStatus !== "all") {
        if (filters.emailStatus === "sent" && !contact.email_sent) return false;
        if (filters.emailStatus === "not_sent" && contact.email_sent) return false;
      }

      // Form status
      if (filters.formStatus !== "all") {
        if (filters.formStatus === "completed" && !contact.form_completed) return false;
        if (filters.formStatus === "pending" && (!contact.email_sent || contact.form_completed)) return false;
        if (filters.formStatus === "not_completed" && contact.form_completed) return false;
      }

      // Legal form
      if (filters.legalForm !== "all" && contact.legal_form !== filters.legalForm) return false;

      // Market type
      if (filters.marketType !== "all" && contact.market_type !== filters.marketType) return false;

      // Target market
      if (filters.targetMarket !== "all" && contact.target_market !== filters.targetMarket) return false;

      // Last mile logistics
      if (filters.isLastMileLogistics !== "all") {
        if (filters.isLastMileLogistics === "yes" && !contact.is_last_mile_logistics) return false;
        if (filters.isLastMileLogistics === "no" && contact.is_last_mile_logistics) return false;
      }

      // Food delivery services
      if (filters.foodDeliveryServices !== "all") {
        if (filters.foodDeliveryServices === "yes" && !contact.food_delivery_services) return false;
        if (filters.foodDeliveryServices === "no" && contact.food_delivery_services) return false;
      }

      // Amazon experience
      if (filters.amazonExperience !== "all") {
        if (filters.amazonExperience === "yes" && !contact.amazon_experience) return false;
        if (filters.amazonExperience === "no" && contact.amazon_experience) return false;
      }

      // Email tracking filters
      if (filters.emailDelivered !== "all") {
        if (filters.emailDelivered === "yes" && !contact.email_delivered) return false;
        if (filters.emailDelivered === "no" && contact.email_delivered) return false;
      }

      if (filters.emailOpened !== "all") {
        if (filters.emailOpened === "yes" && !contact.email_opened) return false;
        if (filters.emailOpened === "no" && contact.email_opened) return false;
      }

      if (filters.emailClicked !== "all") {
        if (filters.emailClicked === "yes" && !contact.email_clicked) return false;
        if (filters.emailClicked === "no" && contact.email_clicked) return false;
      }

      if (filters.profileCompleted !== "all") {
        if (filters.profileCompleted === "yes" && !contact.form_completed) return false;
        if (filters.profileCompleted === "no" && contact.form_completed) return false;
      }

      // Operating Cities
      if (filters.operatingCities.length > 0) {
        // Handle different data formats for operating_cities
        let contactCities: string[] = [];
        
        if (contact.operating_cities) {
          if (Array.isArray(contact.operating_cities)) {
            contactCities = contact.operating_cities;
          } else if (typeof contact.operating_cities === 'string') {
            // Handle string format with line breaks or commas
            contactCities = contact.operating_cities
              .split(/[\n,]/)
              .map(city => city.trim())
              .filter(city => city.length > 0);
          }
        }
        
        // Check if any of the filtered cities match any of the contact's cities
        const hasMatchingCity = filters.operatingCities.some(filterCity => 
          contactCities.some(contactCity => 
            contactCity.toLowerCase().includes(filterCity.toLowerCase()) ||
            filterCity.toLowerCase().includes(contactCity.toLowerCase())
          )
        );
        
        if (!hasMatchingCity) return false;
      }

      // Available Cities (city_availability)
      if (filters.availableCities.length > 0) {
        const cityAvailability = contact.city_availability || {};
        
        // Check if any of the filtered cities are available (marked as true)
        const hasAvailableCity = filters.availableCities.some(filterCity => {
          // Check exact match first
          if (cityAvailability[filterCity] === true) return true;
          
          // Check partial matches in city names
          return Object.keys(cityAvailability).some(availableCity => 
            cityAvailability[availableCity] === true && (
              availableCity.toLowerCase().includes(filterCity.toLowerCase()) ||
              filterCity.toLowerCase().includes(availableCity.toLowerCase())
            )
          );
        });
        
        if (!hasAvailableCity) return false;
      }

      // Vehicle types
      if (filters.vehicleTypes.length > 0) {
        const contactVehicles = contact.vehicle_types || [];
        if (!filters.vehicleTypes.some(type => contactVehicles.includes(type))) return false;
      }

      // Staff types
      if (filters.staffTypes.length > 0) {
        const contactStaff = contact.staff_types || [];
        if (!filters.staffTypes.some(type => contactStaff.includes(type))) return false;
      }

      // Food platforms
      if (filters.foodPlatforms.length > 0) {
        const contactPlatforms = contact.food_delivery_platforms || [];
        if (!filters.foodPlatforms.some(platform => contactPlatforms.includes(platform))) return false;
      }

      // Driver count
      if (filters.minDrivers && (contact.delivery_driver_count || 0) < parseInt(filters.minDrivers)) return false;
      if (filters.maxDrivers && (contact.delivery_driver_count || 0) > parseInt(filters.maxDrivers)) return false;

      // Transporter count
      if (filters.minTransporters && (contact.total_vehicle_count || 0) < parseInt(filters.minTransporters)) return false;
      if (filters.maxTransporters && (contact.total_vehicle_count || 0) > parseInt(filters.maxTransporters)) return false;

      // Last mile since
      if (filters.lastMileSince && contact.last_mile_since_when) {
        if (!contact.last_mile_since_when.toLowerCase().includes(filters.lastMileSince.toLowerCase())) return false;
      }

      return true;
    });

    // Count active filters
    let activeCount = 0;
    if (filters.searchTerm) activeCount++;
    if (filters.emailStatus !== "all") activeCount++;
    if (filters.formStatus !== "all") activeCount++;
    if (filters.legalForm !== "all") activeCount++;
    if (filters.marketType !== "all") activeCount++;
    if (filters.targetMarket !== "all") activeCount++;
    if (filters.isLastMileLogistics !== "all") activeCount++;
    if (filters.foodDeliveryServices !== "all") activeCount++;
    if (filters.amazonExperience !== "all") activeCount++;
    if (filters.emailDelivered !== "all") activeCount++;
    if (filters.emailOpened !== "all") activeCount++;
    if (filters.emailClicked !== "all") activeCount++;
    if (filters.profileCompleted !== "all") activeCount++;
    if (filters.operatingCities.length > 0) activeCount++;
    if (filters.availableCities.length > 0) activeCount++;
    if (filters.vehicleTypes.length > 0) activeCount++;
    if (filters.staffTypes.length > 0) activeCount++;
    if (filters.foodPlatforms.length > 0) activeCount++;
    if (filters.minDrivers) activeCount++;
    if (filters.maxDrivers) activeCount++;
    if (filters.minTransporters) activeCount++;
    if (filters.maxTransporters) activeCount++;
    if (filters.lastMileSince) activeCount++;

    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedContacts = filtered.slice(startIndex, endIndex);
    
    const startItem = filtered.length > 0 ? startIndex + 1 : 0;
    const endItem = Math.min(endIndex, filtered.length);

    return { 
      filteredContacts: filtered, 
      activeFiltersCount: activeCount,
      paginatedContacts,
      totalPages,
      startItem,
      endItem
    };
  }, [contacts, filters, currentPage]);

  return (
    <div className="space-y-6">
      {/* Filter Component */}
      <ContactsFilter 
        filters={filters}
        onFiltersChange={setFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-primary">{filteredContacts.length}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {activeFiltersCount > 0 ? 'Gefilterte Kontakte' : 'Kontakte insgesamt'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-amazon-orange">
              {filteredContacts.filter(c => c.email_sent).length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">E-Mails gesendet</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {filteredContacts.filter(c => c.form_completed).length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Formular ausgefüllt</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-slate-600">
              {filteredContacts.filter(c => c.email_sent && !c.form_completed).length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Wartend auf Antwort</div>
          </CardContent>
        </Card>
      </div>

      {/* Export Buttons - Show when filters are active */}
      {activeFiltersCount > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">{t('contacts:list.export.title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('contacts:list.export.description', { count: filteredContacts.length })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleExportContacts('xlsx')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Excel (XLSX)
                </Button>
                <Button
                  onClick={() => handleExportContacts('csv')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('contacts:list.title')}</CardTitle>
          <CardDescription>
            {filteredContacts.length > 0 && (
              <>
                Zeige {startItem}-{endItem} von {filteredContacts.length} Kontakten
                {totalPages > 1 && ` • Seite ${currentPage} von ${totalPages}`}
                {activeFiltersCount > 0 && ` • ${activeFiltersCount} Filter aktiv`}
              </>
            )}
            {filteredContacts.length === 0 && contacts.length > 0 && "Keine Kontakte gefunden"}
            {contacts.length === 0 && "Keine Kontakte vorhanden"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {contacts.length === 0 
                ? t('contacts:list.empty.noContacts')
                : activeFiltersCount > 0 
                  ? t('contacts:list.empty.noMatchingFilters')
                  : t('contacts:list.empty.notFound')
              }
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="border border-border rounded-lg p-3 sm:p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                       <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <h3 className="font-semibold text-base sm:text-lg break-words">{contact.company_name}</h3>
                        
                        {/* Market Badge */}
                        {(contact.market_type || contact.target_market) && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs font-medium ${
                              contact.market_type === 'bicycle_delivery' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                            }`}
                          >
                            <span className="hidden sm:inline flex items-center gap-1">
                              {contact.market_type === 'bicycle_delivery' ? '🚲' : '🚐'}
                              {contact.market_type === 'bicycle_delivery' ? 'Bicycle' : 'Van'}
                              {contact.target_market && ' • '}
                              {contact.target_market && t(`contacts:filter.targetMarkets.${contact.target_market}`)}
                            </span>
                            <span className="sm:hidden flex items-center gap-1">
                              {contact.market_type === 'bicycle_delivery' ? '🚲' : '🚐'}
                              {contact.target_market && t(`contacts:filter.targetMarkets.${contact.target_market}`)}
                            </span>
                          </Badge>
                        )}
                        
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {contact.email_sent && (
                            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                              <Mail className="h-3 w-3" />
                              <span className="hidden sm:inline">{t('contacts:list.badges.emailSent')}</span>
                              <span className="sm:hidden">{t('contacts:list.badges.sent')}</span>
                            </Badge>
                          )}
                          {contact.form_completed ? (
                            <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 text-xs">
                              <CheckCircle className="h-3 w-3" />
                              <span className="hidden sm:inline">{t('contacts:list.badges.formCompleted')}</span>
                              <span className="sm:hidden">{t('contacts:list.badges.completed')}</span>
                            </Badge>
                          ) : contact.email_sent ? (
                            <Badge variant="outline" className="flex items-center gap-1 text-xs">
                              <XCircle className="h-3 w-3" />
                              <span className="hidden sm:inline">{t('contacts:list.badges.waitingResponse')}</span>
                              <span className="sm:hidden">{t('contacts:list.badges.waiting')}</span>
                            </Badge>
                          ) : null}
                          {contact.is_last_mile_logistics && (
                            <Badge variant="outline" className="text-amazon-blue border-amazon-blue text-xs">
                              {t('contacts:list.badges.lastMile')}
                            </Badge>
                          )}
                          {contact.amazon_experience && (
                            <Badge variant="outline" className="text-amazon-orange border-amazon-orange text-xs">
                              <span className="hidden sm:inline">{t('contacts:list.badges.amazonExperience')}</span>
                              <span className="sm:hidden">{t('contacts:list.badges.amazon')}</span>
                            </Badge>
                          )}
                          {contact.has_comments && (
                            <Badge variant="outline" className="flex items-center gap-1 text-blue-600 border-blue-200 bg-blue-50 text-xs">
                              <MessageCircle className="h-3 w-3" />
                              <span className="hidden sm:inline">{t('contacts:list.badges.hasComments')}</span>
                              <span className="sm:hidden">{t('contacts:list.badges.commented')}</span>
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                          <span className="truncate">{contact.email_address}</span>
                        </div>
                        {(contact.contact_person_first_name || contact.contact_person_last_name) && (
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                            <span className="truncate">{contact.contact_person_first_name} {contact.contact_person_last_name}</span>
                          </div>
                        )}
                        {contact.phone_number && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                            <span>{contact.phone_number}</span>
                          </div>
                        )}
                        {contact.company_address && (
                          <div className="flex items-center gap-2 sm:col-span-2 xl:col-span-1">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                            <span className="truncate">{contact.company_address.substring(0, 50)}...</span>
                          </div>
                        )}
                        {contact.legal_form && (
                          <div className="flex items-center gap-2">
                            <Building className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                            <span>{contact.legal_form}</span>
                          </div>
                        )}
                        {contact.website && (
                          <div className="flex items-center gap-2 sm:col-span-2 xl:col-span-1">
                            <Globe className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                            <span className="truncate">{contact.website}</span>
                          </div>
                        )}
                      </div>

                      {/* Logistics Info */}
                        {((Array.isArray(contact.operating_cities) ? contact.operating_cities.length > 0 : !!contact.operating_cities) || 
                          contact.vehicle_types?.length || contact.delivery_driver_count || contact.total_vehicle_count) && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs sm:text-sm">
                           {((Array.isArray(contact.operating_cities) && contact.operating_cities.length > 0) || 
                             (typeof contact.operating_cities === 'string' && contact.operating_cities.length > 0)) && (
                             <div className="flex items-center gap-2 text-muted-foreground">
                               <MapPin className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                                <span>
                                  {Array.isArray(contact.operating_cities) 
                                    ? t('contacts:list.logistics.citiesCount', { count: contact.operating_cities.length })
                                    : t('contacts:list.logistics.citiesAvailable')
                                  }
                                </span>
                             </div>
                           )}
                           {contact.vehicle_types?.length && (
                             <div className="flex items-center gap-2 text-muted-foreground">
                               <Truck className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                               <span>{t('contacts:list.logistics.vehicleTypesCount', { count: contact.vehicle_types.length })}</span>
                             </div>
                           )}
                            {contact.delivery_driver_count && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                                <span>{t('contacts:list.logistics.driversCount', { count: contact.delivery_driver_count })}</span>
                              </div>
                            )}
                            {contact.total_vehicle_count && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Package className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                                <span>{t('contacts:list.logistics.transportersCount', { count: contact.total_vehicle_count })}</span>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 mt-3 lg:mt-0">
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/contact/${contact.id}`)}
                          className="flex items-center gap-2 flex-1 sm:flex-none"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">{t('contacts:list.actions.details')}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingContact(contact);
                          }}
                          className="flex items-center gap-2 flex-1 sm:flex-none"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="hidden sm:inline">{t('contacts:list.actions.edit')}</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteContact(contact.id, contact.company_name);
                          }}
                          className="flex items-center gap-2 flex-1 sm:flex-none"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">{t('contacts:list.actions.delete')}</span>
                        </Button>
                      </div>
                      
                      {!contact.form_completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const marketType = contact.market_type || 'van_transport';
                            const targetMarket = contact.target_market || 'germany';
                            window.open(`/form/${contact.id}?market=${marketType}&region=${targetMarket}`, '_blank');
                          }}
                          className="flex items-center gap-2 w-full sm:w-auto"
                        >
                          <ArrowRight className="h-4 w-4" />
                          <span className="hidden sm:inline">{t('contacts:list.actions.openForm')}</span>
                          <span className="sm:hidden">{t('contacts:list.actions.form')}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {/* Page Numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(pageNum);
                              }}
                              isActive={currentPage === pageNum}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Contact Dialog */}
      {editingContact && (
        <EditContact
          contact={editingContact}
          isOpen={!!editingContact}
          onClose={() => setEditingContact(null)}
          onSave={() => {
            onContactsChange();
            setEditingContact(null);
          }}
        />
      )}
    </div>
  );
};