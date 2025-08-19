import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, RotateCcw } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const cities = [
  "München", "Garching bei München", "Düsseldorf", "Bochum", "Köln", "Duisburg",
  "Bad Oldesloe", "Nützen", "Hamburg", "Weiterstadt", "Euskirchen", "Raunheim",
  "Mannheim", "Sindelfingen"
];

const vehicleTypes = [
  "Transporter", "Pkw", "Mittel (zwischen 3,5t und 12t)", "LKW über 12t", "Lastenräder/E-Bikes"
];

const staffTypes = ["Vollzeit", "Teilzeit", "Subunternehmer"];

const foodDeliveryPlatforms = [
  "Uber Eats", "Wolt", "Lieferando", "DoorDash", "Andere"
];

const legalForms = ["GmbH", "AG", "UG", "OHG", "Einzelunternehmen", "KG"];

export interface ContactFilters {
  searchTerm: string;
  emailStatus: string;
  formStatus: string;
  legalForm: string;
  marketType: string;
  targetMarket: string;
  isLastMileLogistics: string;
  foodDeliveryServices: string;
  amazonExperience: string;
  emailDelivered: string;
  emailOpened: string;
  emailClicked: string;
  profileCompleted: string;
  operatingCities: string[];
  availableCities: string[];
  vehicleTypes: string[];
  staffTypes: string[];
  foodPlatforms: string[];
  minDrivers: string;
  maxDrivers: string;
  minTransporters: string;
  maxTransporters: string;
  lastMileSince: string;
}

interface ContactsFilterProps {
  filters: ContactFilters;
  onFiltersChange: (filters: ContactFilters) => void;
  activeFiltersCount: number;
}

export const ContactsFilter = ({ filters, onFiltersChange, activeFiltersCount }: ContactsFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();

  const updateFilter = (key: keyof ContactFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleArrayFilter = (key: keyof ContactFilters, item: string) => {
    const currentValue = filters[key] as string[];
    const newValue = currentValue.includes(item)
      ? currentValue.filter(i => i !== item)
      : [...currentValue, item];
    updateFilter(key, newValue);
  };

  const resetFilters = () => {
    onFiltersChange({
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
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('contacts:list.filter')}
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} {t('common:messages.active', { defaultValue: 'aktiv' })}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('common:buttons.reset', { defaultValue: 'Zurücksetzen' })}
            </Button>
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  {isExpanded ? t('contacts:filter.showLess') : t('contacts:filter.showMore')}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('contacts:list.search')}
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label>{t('contacts:filter.emailStatus')}</Label>
            <Select value={filters.emailStatus} onValueChange={(value) => updateFilter('emailStatus', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('contacts:filter.options.all')}</SelectItem>
                <SelectItem value="sent">{t('contacts:filter.options.sent')}</SelectItem>
                <SelectItem value="not_sent">{t('contacts:filter.options.notSent')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('contacts:filter.formStatus')}</Label>
            <Select value={filters.formStatus} onValueChange={(value) => updateFilter('formStatus', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('contacts:filter.options.all')}</SelectItem>
                <SelectItem value="completed">{t('contacts:filter.options.completed')}</SelectItem>
                <SelectItem value="pending">{t('contacts:filter.options.pending')}</SelectItem>
                <SelectItem value="not_completed">{t('contacts:filter.options.notCompleted')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('contacts:filter.legalForm')}</Label>
            <Select value={filters.legalForm} onValueChange={(value) => updateFilter('legalForm', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('contacts:filter.options.all')}</SelectItem>
                {legalForms.map(form => (
                  <SelectItem key={form} value={form}>{form}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('contacts:filter.marketType')}</Label>
            <Select value={filters.marketType} onValueChange={(value) => updateFilter('marketType', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('contacts:filter.options.all')}</SelectItem>
                <SelectItem value="van_transport">{t('contacts:filter.marketTypes.vanTransport')}</SelectItem>
                <SelectItem value="bicycle_delivery">{t('contacts:filter.marketTypes.bicycleDelivery')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('contacts:filter.targetMarket')}</Label>
            <Select value={filters.targetMarket} onValueChange={(value) => updateFilter('targetMarket', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('contacts:filter.options.all')}</SelectItem>
                <SelectItem value="germany">{t('contacts:filter.targetMarkets.germany')}</SelectItem>
                <SelectItem value="uk">{t('contacts:filter.targetMarkets.uk')}</SelectItem>
                <SelectItem value="ireland">{t('contacts:filter.targetMarkets.ireland')}</SelectItem>
                <SelectItem value="milan">{t('contacts:filter.targetMarkets.milan')}</SelectItem>
                <SelectItem value="rome">{t('contacts:filter.targetMarkets.rome')}</SelectItem>
                <SelectItem value="paris">{t('contacts:filter.targetMarkets.paris')}</SelectItem>
                <SelectItem value="barcelona">{t('contacts:filter.targetMarkets.barcelona')}</SelectItem>
                <SelectItem value="madrid">{t('contacts:filter.targetMarkets.madrid')}</SelectItem>
                <SelectItem value="berlin">{t('contacts:filter.targetMarkets.berlin')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Expanded Filters */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-6">
            {/* Email Tracking Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label>{t('contacts:filter.emailDelivered')}</Label>
                <Select value={filters.emailDelivered} onValueChange={(value) => updateFilter('emailDelivered', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('contacts:filter.options.all')}</SelectItem>
                    <SelectItem value="yes">{t('contacts:filter.options.yes')}</SelectItem>
                    <SelectItem value="no">{t('contacts:filter.options.no')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('contacts:filter.emailOpened')}</Label>
                <Select value={filters.emailOpened} onValueChange={(value) => updateFilter('emailOpened', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('contacts:filter.options.all')}</SelectItem>
                    <SelectItem value="yes">{t('contacts:filter.options.yes')}</SelectItem>
                    <SelectItem value="no">{t('contacts:filter.options.no')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('contacts:filter.emailClicked')}</Label>
                <Select value={filters.emailClicked} onValueChange={(value) => updateFilter('emailClicked', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('contacts:filter.options.all')}</SelectItem>
                    <SelectItem value="yes">{t('contacts:filter.options.yes')}</SelectItem>
                    <SelectItem value="no">{t('contacts:filter.options.no')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('contacts:filter.profileCompleted')}</Label>
                <Select value={filters.profileCompleted} onValueChange={(value) => updateFilter('profileCompleted', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('contacts:filter.options.all')}</SelectItem>
                    <SelectItem value="yes">{t('contacts:filter.options.yes')}</SelectItem>
                    <SelectItem value="no">{t('contacts:filter.options.no')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Logistics Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('contacts:filter.lastMileLogistics')}</Label>
                <Select value={filters.isLastMileLogistics} onValueChange={(value) => updateFilter('isLastMileLogistics', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('contacts:filter.options.all')}</SelectItem>
                    <SelectItem value="yes">{t('contacts:filter.options.yes')}</SelectItem>
                    <SelectItem value="no">{t('contacts:filter.options.no')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('contacts:filter.foodDelivery')}</Label>
                <Select value={filters.foodDeliveryServices} onValueChange={(value) => updateFilter('foodDeliveryServices', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('contacts:filter.options.all')}</SelectItem>
                    <SelectItem value="yes">{t('contacts:filter.options.yes')}</SelectItem>
                    <SelectItem value="no">{t('contacts:filter.options.no')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

               <div className="space-y-2">
                 <Label>{t('contacts:filter.subcontractorExperience')}</Label>
                 <Select value={filters.amazonExperience} onValueChange={(value) => updateFilter('amazonExperience', value)}>
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">{t('contacts:filter.options.all')}</SelectItem>
                     <SelectItem value="yes">{t('contacts:filter.options.yes')}</SelectItem>
                     <SelectItem value="no">{t('contacts:filter.options.no')}</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
            </div>

            {/* Number Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>{t('contacts:filter.minDrivers')}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minDrivers}
                  onChange={(e) => updateFilter('minDrivers', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('contacts:filter.maxDrivers')}</Label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={filters.maxDrivers}
                  onChange={(e) => updateFilter('maxDrivers', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('contacts:filter.minTransporters')}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minTransporters}
                  onChange={(e) => updateFilter('minTransporters', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('contacts:filter.maxTransporters')}</Label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={filters.maxTransporters}
                  onChange={(e) => updateFilter('maxTransporters', e.target.value)}
                />
              </div>
            </div>

            {/* Operating Cities Filter */}
            <div className="space-y-2">
              <Label>{t('contacts:filter.operatingCities')}</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                {cities.map(city => (
                  <div key={city} className="flex items-center space-x-2">
                    <Checkbox
                      id={`operating-city-${city}`}
                      checked={filters.operatingCities.includes(city)}
                      onCheckedChange={() => toggleArrayFilter('operatingCities', city)}
                    />
                    <Label htmlFor={`operating-city-${city}`} className="text-sm">
                      {city}
                    </Label>
                  </div>
                ))}
              </div>
              {filters.operatingCities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.operatingCities.map(city => (
                    <Badge key={city} variant="secondary" className="text-xs">
                      {city}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => toggleArrayFilter('operatingCities', city)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Available Cities Filter */}
            <div className="space-y-2">
              <Label>{t('contacts:filter.availableCities')}</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                {cities.map(city => (
                  <div key={city} className="flex items-center space-x-2">
                    <Checkbox
                      id={`available-city-${city}`}
                      checked={filters.availableCities.includes(city)}
                      onCheckedChange={() => toggleArrayFilter('availableCities', city)}
                    />
                    <Label htmlFor={`available-city-${city}`} className="text-sm">
                      {city}
                    </Label>
                  </div>
                ))}
              </div>
              {filters.availableCities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.availableCities.map(city => (
                    <Badge key={city} variant="secondary" className="text-xs">
                      {city}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => toggleArrayFilter('availableCities', city)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Types Filter */}
            <div className="space-y-2">
              <Label>{t('contacts:filter.vehicleTypes')}</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {vehicleTypes.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`vehicle-${type}`}
                      checked={filters.vehicleTypes.includes(type)}
                      onCheckedChange={() => toggleArrayFilter('vehicleTypes', type)}
                    />
                    <Label htmlFor={`vehicle-${type}`} className="text-sm">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
              {filters.vehicleTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.vehicleTypes.map(type => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => toggleArrayFilter('vehicleTypes', type)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Staff Types Filter */}
            <div className="space-y-2">
              <Label>{t('contacts:filter.staffTypes')}</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {staffTypes.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`staff-${type}`}
                      checked={filters.staffTypes.includes(type)}
                      onCheckedChange={() => toggleArrayFilter('staffTypes', type)}
                    />
                    <Label htmlFor={`staff-${type}`} className="text-sm">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
              {filters.staffTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.staffTypes.map(type => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => toggleArrayFilter('staffTypes', type)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Food Delivery Platforms */}
            <div className="space-y-2">
              <Label>Food-Delivery Plattformen</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {foodDeliveryPlatforms.map(platform => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox
                      id={`platform-${platform}`}
                      checked={filters.foodPlatforms.includes(platform)}
                      onCheckedChange={() => toggleArrayFilter('foodPlatforms', platform)}
                    />
                    <Label htmlFor={`platform-${platform}`} className="text-sm">
                      {platform}
                    </Label>
                  </div>
                ))}
              </div>
              {filters.foodPlatforms.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.foodPlatforms.map(platform => (
                    <Badge key={platform} variant="secondary" className="text-xs">
                      {platform}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => toggleArrayFilter('foodPlatforms', platform)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Last Mile Since When */}
            <div className="space-y-2">
              <Label>Last-Mile seit (Suchbegriff)</Label>
              <Input
                placeholder="z.B. 2020, 3 Jahre, seit Anfang..."
                value={filters.lastMileSince}
                onChange={(e) => updateFilter('lastMileSince', e.target.value)}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};