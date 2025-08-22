import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapControls } from "./MapControls";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Loader } from "lucide-react";
import { ContactMapData } from "@/types/contact";

// Lazy load the map component to avoid SSR issues
const ContactsMap = lazy(() => import("./ContactsMap").then(module => ({
  default: module.ContactsMap
})));

// Error boundary component for map
function MapErrorBoundary({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      if (error.message.includes('leaflet') || error.message.includes('a is not a function')) {
        setHasError(true);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface Contact {
  id: string;
  company_name: string;
  company_address?: string;
  operating_cities?: string[];
  market_type?: string;
  target_market?: string;
  email_sent: boolean;
  form_completed: boolean;
  latitude?: number;
  longitude?: number;
  [key: string]: any;
}

interface MapViewProps {
  contacts: Contact[];
  onContactsChange: () => void;
}

export function MapView({ contacts, onContactsChange }: MapViewProps) {
  const { t } = useTranslation(['dashboard']);
  const { toast } = useToast();
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [filters, setFilters] = useState({
    marketType: 'all',
    targetMarket: 'all',
    city: 'all',
    status: 'all'
  });

  // Filter contacts based on current filters
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      if (filters.marketType !== 'all' && contact.market_type !== filters.marketType) {
        return false;
      }
      if (filters.targetMarket !== 'all' && contact.target_market !== filters.targetMarket) {
        return false;
      }
      if (filters.city !== 'all') {
        const hasCity = contact.operating_cities?.includes(filters.city) || 
                       contact.company_address?.toLowerCase().includes(filters.city.toLowerCase());
        if (!hasCity) return false;
      }
      if (filters.status === 'withEmail' && !contact.email_sent) {
        return false;
      }
      if (filters.status === 'withoutEmail' && contact.email_sent) {
        return false;
      }
      if (filters.status === 'formCompleted' && !contact.form_completed) {
        return false;
      }
      return true;
    });
  }, [contacts, filters]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const marketTypes = [...new Set(contacts.map(c => c.market_type).filter(Boolean))];
    const targetMarkets = [...new Set(contacts.map(c => c.target_market).filter(Boolean))];
    const cities = [...new Set(contacts.flatMap(c => c.operating_cities || []).filter(Boolean))];
    
    return { marketTypes, targetMarkets, cities };
  }, [contacts]);

  const handleGeocodeAddresses = async () => {
    setIsGeocoding(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('geocode-addresses', {
        body: { batch: true }
      });

      if (error) {
        console.error('Geocoding error:', error);
        toast({
          title: "Error",
          description: t('dashboard:map.geocoding.failed'),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: t('dashboard:map.geocoding.completed'),
        });
        onContactsChange(); // Refresh contacts to get updated coordinates
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: "Error",
        description: t('dashboard:map.geocoding.failed'),
        variant: "destructive",
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  const contactsWithCoordinates = filteredContacts.filter(c => c.latitude && c.longitude) as ContactMapData[];
  const contactsWithoutCoordinates = filteredContacts.filter(c => !c.latitude || !c.longitude);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {t('dashboard:map.title')}
        </h2>
        <p className="text-muted-foreground mb-6">
          {t('dashboard:map.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MapControls
                filters={filters}
                onFiltersChange={setFilters}
                filterOptions={filterOptions}
              />
              
              {contactsWithoutCoordinates.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Button
                    onClick={handleGeocodeAddresses}
                    disabled={isGeocoding}
                    variant="outline"
                    className="w-full"
                  >
                    {isGeocoding ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        {t('dashboard:map.geocoding.inProgress')}
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 mr-2" />
                        Geocode {contactsWithoutCoordinates.length} addresses
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div className="h-[600px] rounded-lg overflow-hidden">
                <MapErrorBoundary 
                  fallback={
                    <div className="flex flex-col items-center justify-center h-full bg-muted rounded-lg">
                      <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center">
                        Map could not be loaded. <br />
                        Showing {contactsWithCoordinates.length} contacts with coordinates.
                      </p>
                      <div className="mt-4 text-sm text-muted-foreground">
                        {contactsWithCoordinates.slice(0, 5).map(contact => (
                          <div key={contact.id} className="py-1">
                            📍 {contact.company_name} - {contact.company_address}
                          </div>
                        ))}
                        {contactsWithCoordinates.length > 5 && (
                          <div className="py-1">... and {contactsWithCoordinates.length - 5} more</div>
                        )}
                      </div>
                    </div>
                  }
                >
                  <Suspense fallback={
                    <div className="flex items-center justify-center h-full">
                      <Loader className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  }>
                    <ContactsMap contacts={contactsWithCoordinates} />
                  </Suspense>
                </MapErrorBoundary>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{filteredContacts.length}</div>
            <div className="text-sm text-muted-foreground">Total Contacts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{contactsWithCoordinates.length}</div>
            <div className="text-sm text-muted-foreground">On Map</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amazon-orange">{contactsWithoutCoordinates.length}</div>
            <div className="text-sm text-muted-foreground">Need Geocoding</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amazon-blue">
              {filteredContacts.filter(c => c.email_sent).length}
            </div>
            <div className="text-sm text-muted-foreground">Emails Sent</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}