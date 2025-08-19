import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Users2, Package, Shield, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Contact {
  id: string;
  company_name: string;
  email_address: string;
  market_type?: string;
  target_market?: string;
  // Van Transport specific fields
  full_time_drivers?: number;
  transporter_count?: number;
  vehicle_types?: string[];
  staff_types?: string[];
  food_delivery_services?: boolean;
  food_delivery_platforms?: string[];
  amazon_experience?: boolean;
  amazon_work_capacity?: string;
  is_last_mile_logistics?: boolean;
  last_mile_since_when?: string;
  total_vehicle_count?: number;
  operating_cities?: string[];
  operates_multiple_countries?: boolean;
  operates_multiple_cities?: boolean;
}

interface ContactDetailsVanTransportProps {
  contact: Contact;
}

export const ContactDetailsVanTransport = ({ contact }: ContactDetailsVanTransportProps) => {
  const { t } = useTranslation('contacts');

  return (
    <>
      {/* Van Transport Personnel & Logistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-amazon-blue" />
            Personal & Logistik
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {contact.full_time_drivers !== undefined && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Vollzeit-Fahrer: </span>
              <Badge variant="outline">{contact.full_time_drivers}</Badge>
            </div>
          )}
          {contact.transporter_count !== undefined && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Transporter-Anzahl: </span>
              <Badge variant="outline">{contact.transporter_count}</Badge>
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
          {contact.is_last_mile_logistics !== undefined && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Last-Mile-Logistik: </span>
              <Badge variant={contact.is_last_mile_logistics ? "default" : "secondary"}>
                {contact.is_last_mile_logistics ? "✓ Ja" : "✗ Nein"}
              </Badge>
            </div>
          )}
          {contact.last_mile_since_when && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Seit wann: </span>
              <span className="text-muted-foreground">{contact.last_mile_since_when}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Van Transport Vehicles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-amazon-blue" />
            Fahrzeuge & Ausrüstung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {contact.vehicle_types && contact.vehicle_types.length > 0 && (
            <div>
              <span className="font-medium">Fahrzeugtypen: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {contact.vehicle_types.map((type, index) => (
                  <Badge key={index} variant="outline">{type}</Badge>
                ))}
              </div>
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

      {/* Van Transport Platform Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amazon-blue" />
            Plattform & Amazon Erfahrung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {contact.food_delivery_services !== undefined && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Food Delivery Services: </span>
              <Badge variant={contact.food_delivery_services ? "default" : "secondary"}>
                {contact.food_delivery_services ? "✓ Ja" : "✗ Nein"}
              </Badge>
            </div>
          )}
          {contact.food_delivery_platforms && contact.food_delivery_platforms.length > 0 && (
            <div>
              <span className="font-medium">Food Delivery Plattformen: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {contact.food_delivery_platforms.map((platform, index) => (
                  <Badge key={index} variant="outline">{platform}</Badge>
                ))}
              </div>
            </div>
          )}
          {contact.amazon_experience !== undefined && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Amazon Erfahrung: </span>
              <Badge variant={contact.amazon_experience ? "default" : "secondary"}>
                {contact.amazon_experience ? "✓ Ja" : "✗ Nein"}
              </Badge>
            </div>
          )}
          {contact.amazon_work_capacity && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Amazon Arbeitskapazität: </span>
              <span className="text-muted-foreground">{contact.amazon_work_capacity}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Operating Scope (Common for both but showing in Van Transport for completeness) */}
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