import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface MapControlsProps {
  filters: {
    marketType: string;
    targetMarket: string;
    city: string;
    status: string;
  };
  onFiltersChange: (filters: any) => void;
  filterOptions: {
    marketTypes: string[];
    targetMarkets: string[];
    cities: string[];
  };
}

export function MapControls({ filters, onFiltersChange, filterOptions }: MapControlsProps) {
  const { t } = useTranslation(['dashboard']);

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const marketTypeLabels: Record<string, string> = {
    'van_transport': '🚐 Van Transport',
    'bicycle_delivery': '🚲 Bicycle Delivery'
  };

  const targetMarketLabels: Record<string, string> = {
    'germany': '🇩🇪 Germany',
    'spain': '🇪🇸 Spain', 
    'italy': '🇮🇹 Italy',
    'france': '🇫🇷 France'
  };

  const statusLabels: Record<string, string> = {
    'all': t('dashboard:map.filters.all'),
    'withEmail': t('dashboard:map.filters.withEmail'),
    'withoutEmail': t('dashboard:map.filters.withoutEmail'),
    'formCompleted': t('dashboard:map.filters.formCompleted')
  };

  return (
    <div className="space-y-4">
      {/* Market Type Filter */}
      <div className="space-y-2">
        <Label htmlFor="marketType">{t('dashboard:map.filters.marketType')}</Label>
        <Select
          value={filters.marketType}
          onValueChange={(value) => handleFilterChange('marketType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select market type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('dashboard:map.filters.all')}</SelectItem>
            {filterOptions.marketTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {marketTypeLabels[type] || type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Target Market Filter */}
      <div className="space-y-2">
        <Label htmlFor="targetMarket">{t('dashboard:map.filters.targetMarket')}</Label>
        <Select
          value={filters.targetMarket}
          onValueChange={(value) => handleFilterChange('targetMarket', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select target market" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('dashboard:map.filters.all')}</SelectItem>
            {filterOptions.targetMarkets.map((market) => (
              <SelectItem key={market} value={market}>
                {targetMarketLabels[market] || market}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City Filter */}
      <div className="space-y-2">
        <Label htmlFor="city">{t('dashboard:map.filters.city')}</Label>
        <Select
          value={filters.city}
          onValueChange={(value) => handleFilterChange('city', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('dashboard:map.filters.all')}</SelectItem>
            {filterOptions.cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <Label htmlFor="status">{t('dashboard:map.filters.status')}</Label>
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}