import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bike, Users2, Package, Shield, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Contact {
  id: string;
  company_name: string;
  email_address: string;
  market_type?: string;
  target_market?: string;
  // Bicycle Delivery specific fields
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
  staff_types?: string[];
  total_vehicle_count?: number;
  operates_multiple_countries?: boolean;
  operates_multiple_cities?: boolean;
}

interface ContactDetailsBicycleDeliveryProps {
  contact: Contact;
}

export const ContactDetailsBicycleDelivery = ({ contact }: ContactDetailsBicycleDeliveryProps) => {
  const { t } = useTranslation('contacts');

  return (
    <>
      {/* Bicycle Personnel & Employment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-amazon-blue" />
            Personal & Beschäftigung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {contact.delivery_driver_count !== undefined && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Lieferfahrer: </span>
              <Badge variant="outline">{contact.delivery_driver_count}</Badge>
            </div>
          )}
          {contact.bicycle_driver_count !== undefined && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Fahrradfahrer: </span>
              <Badge variant="outline">{contact.bicycle_driver_count}</Badge>
            </div>
          )}
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
          {contact.staff_types && contact.staff_types.length > 0 && (
            <div>
              <span className="font-medium">Personalarten: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {contact.staff_types.map((type, index) => (
                  <Badge key={index} variant="outline">{type}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bicycle Equipment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bike className="h-5 w-5 text-amazon-blue" />
            Fahrzeuge & Ausrüstung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {contact.bicycle_count !== undefined && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Fahrräder: </span>
              <Badge variant="outline">{contact.bicycle_count}</Badge>
            </div>
          )}
          {contact.cargo_bike_count !== undefined && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Cargo Bikes: </span>
              <Badge variant="outline">{contact.cargo_bike_count}</Badge>
            </div>
          )}
          {contact.uses_cargo_bikes !== undefined && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Nutzt Cargo Bikes: </span>
              <Badge variant={contact.uses_cargo_bikes ? "default" : "secondary"}>
                {contact.uses_cargo_bikes ? "✓ Ja" : "✗ Nein"}
              </Badge>
            </div>
          )}
          {contact.company_owns_vehicles !== undefined && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Eigene Fahrzeuge: </span>
              <Badge variant={contact.company_owns_vehicles ? "default" : "secondary"}>
                {contact.company_owns_vehicles ? "✓ Ja" : "✗ Nein"}
              </Badge>
            </div>
          )}
          {contact.total_vehicle_count !== undefined && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Gesamtfahrzeuge: </span>
              <Badge variant="outline">{contact.total_vehicle_count}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Experience for Bicycle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amazon-blue" />
            Plattform-Erfahrung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {contact.works_for_quick_commerce !== undefined && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Quick Commerce: </span>
              <Badge variant={contact.works_for_quick_commerce ? "default" : "secondary"}>
                {contact.works_for_quick_commerce ? "✓ Ja" : "✗ Nein"}
              </Badge>
            </div>
          )}
          {contact.works_for_gig_economy_food !== undefined && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Gig Economy Food: </span>
              <Badge variant={contact.works_for_gig_economy_food ? "default" : "secondary"}>
                {contact.works_for_gig_economy_food ? "✓ Ja" : "✗ Nein"}
              </Badge>
            </div>
          )}
          {contact.quick_commerce_companies && contact.quick_commerce_companies.length > 0 && (
            <div>
              <span className="font-medium">Quick Commerce Plattformen: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {contact.quick_commerce_companies.map((company, index) => (
                  <Badge key={index} variant="outline">{company}</Badge>
                ))}
              </div>
            </div>
          )}
          {contact.gig_economy_companies && contact.gig_economy_companies.length > 0 && (
            <div>
              <span className="font-medium">Gig Economy Plattformen: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {contact.gig_economy_companies.map((company, index) => (
                  <Badge key={index} variant="outline">{company}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Operating Scope */}
      {(contact.operates_multiple_countries !== undefined || contact.operates_multiple_cities !== undefined) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amazon-blue" />
              Operativer Bereich
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {contact.operates_multiple_countries !== undefined && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Mehrere Länder: </span>
                <Badge variant={contact.operates_multiple_countries ? "default" : "secondary"}>
                  {contact.operates_multiple_countries ? "✓ Ja" : "✗ Nein"}
                </Badge>
              </div>
            )}
            {contact.operates_multiple_cities !== undefined && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Mehrere Städte: </span>
                <Badge variant={contact.operates_multiple_cities ? "default" : "secondary"}>
                  {contact.operates_multiple_cities ? "✓ Ja" : "✗ Nein"}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};