import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Save, Trash2, Plus, Settings } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MetaPixelSettingsProps {
  user: User | null;
}

interface MetaPixelSetting {
  id: string;
  market_type: string;
  target_market: string;
  pixel_code: string;
  created_at: string;
  updated_at: string;
}

const MetaPixelSettings = ({ user }: MetaPixelSettingsProps) => {
  const { t } = useTranslation(['settings', 'common']);
  const { toast } = useToast();
  const [settings, setSettings] = useState<MetaPixelSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New setting form
  const [newSetting, setNewSetting] = useState({
    market_type: '',
    target_market: '',
    pixel_code: ''
  });

  const marketTypes = [
    { value: 'van_transport', label: t('settings:metaPixel.marketTypes.vanTransport', 'Van Transport') },
    { value: 'bicycle_delivery', label: t('settings:metaPixel.marketTypes.bicycleDelivery', 'Bicycle Delivery') }
  ];

  const targetMarkets = [
    { value: 'germany', label: t('settings:metaPixel.targetMarkets.germany', 'Germany') },
    { value: 'uk', label: t('settings:metaPixel.targetMarkets.uk', 'UK') },
    { value: 'ireland', label: t('settings:metaPixel.targetMarkets.ireland', 'Ireland') },
    { value: 'france', label: t('settings:metaPixel.targetMarkets.france', 'France') },
    { value: 'italy', label: t('settings:metaPixel.targetMarkets.italy', 'Italy') },
    { value: 'spain', label: t('settings:metaPixel.targetMarkets.spain', 'Spain') },
    { value: 'paris', label: t('settings:metaPixel.targetMarkets.paris', 'Paris') },
    { value: 'milan', label: t('settings:metaPixel.targetMarkets.milan', 'Milan') },
    { value: 'rome', label: t('settings:metaPixel.targetMarkets.rome', 'Rome') },
    { value: 'berlin', label: t('settings:metaPixel.targetMarkets.berlin', 'Berlin') },
    { value: 'barcelona', label: t('settings:metaPixel.targetMarkets.barcelona', 'Barcelona') },
    { value: 'madrid', label: t('settings:metaPixel.targetMarkets.madrid', 'Madrid') }
  ];

  const fetchSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meta_pixel_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching meta pixel settings:', error);
        toast({
          title: t('common:messages.error'),
          description: t('settings:metaPixel.errors.loadFailed', 'Failed to load Meta Pixel settings'),
          variant: 'destructive'
        });
        return;
      }

      setSettings(data || []);
    } catch (error) {
      console.error('Error in fetchSettings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const validatePixelCode = (pixelCode: string) => {
    // Basic validation for Meta Pixel Code - should contain fbq and init
    return pixelCode.includes('fbq') && pixelCode.includes('init') && pixelCode.trim().length > 50;
  };

  const handleSaveNewSetting = async () => {
    if (!user || !newSetting.market_type || !newSetting.target_market || !newSetting.pixel_code) {
      toast({
        title: t('common:messages.error'),
        description: t('settings:metaPixel.errors.fillAllFields'),
        variant: 'destructive'
      });
      return;
    }

    if (!validatePixelCode(newSetting.pixel_code)) {
      toast({
        title: t('common:messages.error'),
        description: t('settings:metaPixel.errors.invalidPixelCode'),
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('meta_pixel_settings')
        .insert({
          user_id: user.id,
          market_type: newSetting.market_type,
          target_market: newSetting.target_market,
          pixel_code: newSetting.pixel_code
        });

      if (error) {
        console.error('Error saving Meta Pixel setting:', error);
        toast({
          title: t('common:messages.error'),
          description: error.message.includes('duplicate key') 
            ? t('settings:metaPixel.errors.duplicateConfiguration')
            : t('settings:metaPixel.errors.saveFailed'),
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: t('common:messages.success'),
        description: t('settings:metaPixel.success.saved')
      });

      // Reset form
      setNewSetting({ market_type: '', target_market: '', pixel_code: '' });
      
      // Refresh settings
      fetchSettings();
    } catch (error) {
      console.error('Error in handleSaveNewSetting:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSetting = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meta_pixel_settings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting Meta Pixel setting:', error);
        toast({
          title: t('common:messages.error'),
          description: t('settings:metaPixel.errors.deleteFailed'),
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: t('common:messages.success'),
        description: t('settings:metaPixel.success.deleted')
      });

      // Refresh settings
      fetchSettings();
    } catch (error) {
      console.error('Error in handleDeleteSetting:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">{t('settings:metaPixel.title')}</h2>
        <p className="text-muted-foreground">
          {t('settings:metaPixel.subtitle')}
        </p>
      </div>

      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          {t('settings:metaPixel.infoMessage')}
        </AlertDescription>
      </Alert>

      {/* Add New Setting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t('settings:metaPixel.addNew')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="market_type">{t('settings:metaPixel.marketType')}</Label>
                <Select
                  value={newSetting.market_type}
                  onValueChange={(value) => setNewSetting(prev => ({ ...prev, market_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings:metaPixel.selectMarketType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {marketTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="target_market">{t('settings:metaPixel.targetMarket')}</Label>
                <Select
                  value={newSetting.target_market}
                  onValueChange={(value) => setNewSetting(prev => ({ ...prev, target_market: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings:metaPixel.selectTargetMarket')} />
                  </SelectTrigger>
                  <SelectContent>
                    {targetMarkets.map(market => (
                      <SelectItem key={market.value} value={market.value}>
                        {market.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="pixel_code">{t('settings:metaPixel.pixelCode')}</Label>
              <Textarea
                id="pixel_code"
                placeholder={t('settings:metaPixel.pixelCodePlaceholder')}
                value={newSetting.pixel_code}
                onChange={(e) => setNewSetting(prev => ({ ...prev, pixel_code: e.target.value }))}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('settings:metaPixel.pixelCodeHelp')}
              </p>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleSaveNewSetting} 
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? t('settings:metaPixel.saving') : t('settings:metaPixel.save')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings:metaPixel.current')}</CardTitle>
        </CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t('settings:metaPixel.noConfigurations')}</p>
              <p className="text-sm text-muted-foreground">{t('settings:metaPixel.addFirst')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {settings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1 mr-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{setting.market_type}</Badge>
                      <Badge variant="outline">{setting.target_market}</Badge>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">
                        {setting.pixel_code.substring(0, 200)}
                        {setting.pixel_code.length > 200 && '...'}
                      </pre>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {new Date(setting.updated_at).toLocaleDateString()}
                    </Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSetting(setting.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MetaPixelSettings;
