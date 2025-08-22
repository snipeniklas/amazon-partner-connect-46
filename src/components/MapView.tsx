import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContactsMap } from "./ContactsMap";
import { MapControls } from "./MapControls";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Loader } from "lucide-react";
import { ContactMapData } from "@/types/contact";

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
                <ContactsMap contacts={contactsWithCoordinates} />
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