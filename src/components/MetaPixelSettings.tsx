import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  pixel_id: string;
  created_at: string;
  updated_at: string;
}

const MetaPixelSettings = ({ user }: MetaPixelSettingsProps) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const { toast } = useToast();
  const [settings, setSettings] = useState<MetaPixelSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New setting form
  const [newSetting, setNewSetting] = useState({
    market_type: '',
    target_market: '',
    pixel_id: ''
  });

  const marketTypes = [
    { value: 'van_transport', label: 'Van Transport' },
    { value: 'bicycle_delivery', label: 'Bicycle Delivery' }
  ];

  const targetMarkets = [
    { value: 'germany', label: 'Germany' },
    { value: 'uk', label: 'UK' },
    { value: 'ireland', label: 'Ireland' },
    { value: 'france', label: 'France' },
    { value: 'italy', label: 'Italy' },
    { value: 'spain', label: 'Spain' },
    { value: 'paris', label: 'Paris' },
    { value: 'milan', label: 'Milan' },
    { value: 'rome', label: 'Rome' },
    { value: 'berlin', label: 'Berlin' },
    { value: 'barcelona', label: 'Barcelona' },
    { value: 'madrid', label: 'Madrid' }
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
          description: 'Failed to load Meta Pixel settings',
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

  const validatePixelId = (pixelId: string) => {
    // Basic validation for Meta Pixel ID format
    return /^\d{15,16}$/.test(pixelId);
  };

  const handleSaveNewSetting = async () => {
    if (!user || !newSetting.market_type || !newSetting.target_market || !newSetting.pixel_id) {
      toast({
        title: t('common:messages.error'),
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    if (!validatePixelId(newSetting.pixel_id)) {
      toast({
        title: t('common:messages.error'),
        description: 'Invalid Meta Pixel ID format. It should be 15-16 digits.',
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
          pixel_id: newSetting.pixel_id
        });

      if (error) {
        console.error('Error saving Meta Pixel setting:', error);
        toast({
          title: t('common:messages.error'),
          description: error.message.includes('duplicate key') 
            ? 'A setting for this market type and target market already exists'
            : 'Failed to save Meta Pixel setting',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: t('common:messages.success'),
        description: 'Meta Pixel setting saved successfully'
      });

      // Reset form
      setNewSetting({ market_type: '', target_market: '', pixel_id: '' });
      
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
          description: 'Failed to delete Meta Pixel setting',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: t('common:messages.success'),
        description: 'Meta Pixel setting deleted successfully'
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
        <h2 className="text-3xl font-bold text-foreground mb-2">Meta Pixel Settings</h2>
        <p className="text-muted-foreground">
          Configure Meta Pixel IDs for tracking on your public forms
        </p>
      </div>

      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          Meta Pixel IDs werden automatisch in die öffentlichen Formulare eingefügt basierend auf Market Type und Target Market. 
          Jede Kombination kann nur einmal konfiguriert werden.
        </AlertDescription>
      </Alert>

      {/* Add New Setting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Meta Pixel Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="market_type">Market Type</Label>
              <Select
                value={newSetting.market_type}
                onValueChange={(value) => setNewSetting(prev => ({ ...prev, market_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select market type" />
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
              <Label htmlFor="target_market">Target Market</Label>
              <Select
                value={newSetting.target_market}
                onValueChange={(value) => setNewSetting(prev => ({ ...prev, target_market: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target market" />
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

            <div>
              <Label htmlFor="pixel_id">Meta Pixel ID</Label>
              <Input
                id="pixel_id"
                placeholder="123456789012345"
                value={newSetting.pixel_id}
                onChange={(e) => setNewSetting(prev => ({ ...prev, pixel_id: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                15-16 digits from your Meta Business Manager
              </p>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleSaveNewSetting} 
                disabled={saving}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Current Meta Pixel Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No Meta Pixel configurations found</p>
              <p className="text-sm text-muted-foreground">Add your first configuration above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {settings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{setting.market_type}</Badge>
                        <Badge variant="outline">{setting.target_market}</Badge>
                      </div>
                      <p className="font-mono text-sm">{setting.pixel_id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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
