import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MapPin, Mail, FileCheck, Building, Users, Truck } from "lucide-react";
import { ContactMapData } from "@/types/contact";

interface ContactPopupProps {
  contact: ContactMapData;
}

export function ContactPopup({ contact }: ContactPopupProps) {
  const { t } = useTranslation(['dashboard']);
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/contact/${contact.id}`);
  };

  const getMarketTypeBadge = (marketType: string) => {
    const isVan = marketType === 'van_transport';
    return (
      <Badge 
        variant={isVan ? "default" : "secondary"}
        className={isVan ? "bg-amazon-blue" : "bg-green-600"}
      >
        {isVan ? '🚐 Van Transport' : '🚲 Bicycle Delivery'}
      </Badge>
    );
  };

  const getTargetMarketBadge = (targetMarket: string) => {
    const marketLabels: Record<string, string> = {
      'germany': '🇩🇪 Germany',
      'spain': '🇪🇸 Spain',
      'italy': '🇮🇹 Italy',
      'france': '🇫🇷 France'
    };
    
    return (
      <Badge variant="outline">
        {marketLabels[targetMarket] || targetMarket}
      </Badge>
    );
  };

  return (
    <div className="p-2 min-w-[250px]">
      <div className="space-y-3">
        {/* Company Name */}
        <div>
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <Building className="h-4 w-4" />
            {contact.company_name}
          </h3>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {contact.market_type && getMarketTypeBadge(contact.market_type)}
          {contact.target_market && getTargetMarketBadge(contact.target_market)}
        </div>

        {/* Address */}
        {contact.company_address && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{contact.company_address}</span>
          </div>
        )}

        {/* Operating Cities */}
        {contact.operating_cities && contact.operating_cities.length > 0 && (
          <div className="text-sm">
            <span className="font-medium">Operating Cities:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {contact.operating_cities.slice(0, 3).map((city, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {city}
                </Badge>
              ))}
              {contact.operating_cities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{contact.operating_cities.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Vehicle/Driver Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {contact.market_type === 'van_transport' && (
            <>
              {contact.full_time_drivers && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span className="text-xs">{contact.full_time_drivers} drivers</span>
                </div>
              )}
              {contact.transporter_count && (
                <div className="flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  <span className="text-xs">{contact.transporter_count} vehicles</span>
                </div>
              )}
            </>
          )}
          {contact.market_type === 'bicycle_delivery' && contact.bicycle_count && (
            <div className="flex items-center gap-1">
              <span className="text-xs">🚲</span>
              <span className="text-xs">{contact.bicycle_count} bikes</span>
            </div>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex gap-2">
          {contact.email_sent && (
            <Badge variant="outline" className="text-xs">
              <Mail className="h-3 w-3 mr-1" />
              Email Sent
            </Badge>
          )}
          {contact.form_completed && (
            <Badge variant="outline" className="text-xs">
              <FileCheck className="h-3 w-3 mr-1" />
              Form Complete
            </Badge>
          )}
        </div>

        {/* Action Button */}
        <Button 
          onClick={handleViewDetails}
          size="sm"
          className="w-full mt-3"
        >
          {t('dashboard:map.markers.viewDetails')}
        </Button>
      </div>
    </div>
  );
}