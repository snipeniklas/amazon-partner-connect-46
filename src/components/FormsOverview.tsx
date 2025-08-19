import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { marketConfigs } from "@/config/marketConfigs";
import { ExternalLink, Bike, Truck, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface FormsOverviewProps {
  accessibleMarkets?: string[];
  isAdmin?: boolean;
}

export const FormsOverview: React.FC<FormsOverviewProps> = ({ accessibleMarkets, isAdmin }) => {
  const { t } = useTranslation(['dashboard', 'forms']);
  const { toast } = useToast();
  const [copiedUrls, setCopiedUrls] = useState<Set<string>>(new Set());
  
  // Filter markets based on user permissions
  const getFilteredMarkets = (marketType: 'van_transport' | 'bicycle_delivery') => {
    const allMarkets = Object.entries(marketConfigs[marketType]);
    
    // Admin sees all markets
    if (isAdmin) {
      return allMarkets;
    }
    
    // No specific restrictions - show all markets (backward compatibility)
    if (!accessibleMarkets || accessibleMarkets.length === 0) {
      return allMarkets;
    }
    
    // Filter based on user's allowed markets
    return allMarkets.filter(([market]) => accessibleMarkets.includes(market));
  };

  const getDemoUrl = (marketType: string, targetMarket: string) => {
    return `/form/demo?market=${marketType}&region=${targetMarket}`;
  };

  const getPublicUrl = (marketType: string, targetMarket: string) => {
    return `/form?market=${marketType}&region=${targetMarket}`;
  };

  const copyToClipboard = async (url: string, marketType: string, targetMarket: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      const key = `${marketType}-${targetMarket}`;
      setCopiedUrls(prev => new Set(prev).add(key));
      toast({
        title: t('forms:buttons.linkCopied'),
        description: fullUrl,
      });
      setTimeout(() => {
        setCopiedUrls(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getMarketDisplayName = (market: string) => {
    return t(`forms:markets.${market}`, { defaultValue: market.toUpperCase() });
  };

  const getMarketTypeDisplayName = (marketType: string) => {
    return t(`forms:marketTypes.${marketType}`, { defaultValue: marketType });
  };

  return (
    <div className="space-y-6">
      {/* Van/Transport Markets */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Truck className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{getMarketTypeDisplayName('van_transport')}</h3>
          <Badge variant="secondary">{getFilteredMarkets('van_transport').length} {t('dashboard:forms.markets')}</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getFilteredMarkets('van_transport').map(([market, config]) => (
            <Card key={market} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  {getMarketDisplayName(market)}
                  <Badge variant="outline" className="text-xs">
                    {config.cities?.length || 0} {t('dashboard:forms.cities')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground space-y-1">
                  <div><strong>{t('dashboard:forms.vehicleTypes')}:</strong> {config.vehicleTypes.length}</div>
                  <div><strong>{t('dashboard:forms.platforms')}:</strong> {config.platforms.length}</div>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    size="sm" 
                    className="w-full flex items-center gap-2"
                    onClick={() => window.open(getPublicUrl('van_transport', market), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    {t('forms:buttons.publicForm')}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 flex items-center gap-2"
                      onClick={() => window.open(getDemoUrl('van_transport', market), '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t('forms:buttons.viewDemo')}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(getPublicUrl('van_transport', market), 'van_transport', market)}
                      title={t('forms:buttons.shareWithPartners')}
                    >
                      {copiedUrls.has(`van_transport-${market}`) ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bicycle Delivery Markets */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Bike className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{getMarketTypeDisplayName('bicycle_delivery')}</h3>
          <Badge variant="secondary">{getFilteredMarkets('bicycle_delivery').length} {t('dashboard:forms.markets')}</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getFilteredMarkets('bicycle_delivery').map(([market, config]) => (
            <Card key={market} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  {getMarketDisplayName(market)}
                  <Badge variant="outline" className="text-xs">
                    {config.zones?.length || 0} {t('dashboard:forms.zones')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground space-y-1">
                  <div><strong>{t('dashboard:forms.vehicleTypes')}:</strong> {config.vehicleTypes.length}</div>
                  <div><strong>{t('dashboard:forms.platforms')}:</strong> {config.platforms.length}</div>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    size="sm" 
                    className="w-full flex items-center gap-2"
                    onClick={() => window.open(getPublicUrl('bicycle_delivery', market), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    {t('forms:buttons.publicForm')}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 flex items-center gap-2"
                      onClick={() => window.open(getDemoUrl('bicycle_delivery', market), '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t('forms:buttons.viewDemo')}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(getPublicUrl('bicycle_delivery', market), 'bicycle_delivery', market)}
                      title={t('forms:buttons.shareWithPartners')}
                    >
                      {copiedUrls.has(`bicycle_delivery-${market}`) ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2">{t('dashboard:forms.summary.title')}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {getFilteredMarkets('van_transport').length + getFilteredMarkets('bicycle_delivery').length}
            </div>
            <div className="text-muted-foreground">{t('dashboard:forms.summary.totalMarkets')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">2</div>
            <div className="text-muted-foreground">{t('dashboard:forms.summary.marketTypes')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {getFilteredMarkets('van_transport').length}
            </div>
            <div className="text-muted-foreground">{t('dashboard:forms.summary.vanMarkets')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {getFilteredMarkets('bicycle_delivery').length}
            </div>
            <div className="text-muted-foreground">{t('dashboard:forms.summary.bikeMarkets')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};