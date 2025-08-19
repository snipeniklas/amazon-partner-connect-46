import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/hooks/useUserPermissions';
import { Users, Shield, Globe, Truck } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
}

const AVAILABLE_MARKETS = [
  { value: 'germany', label: 'Germany' },
  { value: 'uk', label: 'UK' },
  { value: 'italy', label: 'Italy' },
  { value: 'spain', label: 'Spain' },
  { value: 'france', label: 'France' },
  { value: 'netherlands', label: 'Netherlands' },
  { value: 'belgium', label: 'Belgium' },
  { value: 'austria', label: 'Austria' },
  { value: 'switzerland', label: 'Switzerland' }
];

const AVAILABLE_MARKET_TYPES = [
  { value: 'van_transport', label: 'Van Transport' },
  { value: 'bicycle_delivery', label: 'Bicycle Delivery' }
];

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsersAndProfiles();
  }, []);

  const fetchUsersAndProfiles = async () => {
    try {
      setLoading(true);
      
      // Fetch user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast({
          title: "Error",
          description: "Failed to load user profiles.",
          variant: "destructive",
        });
        return;
      }

      setUserProfiles(profiles || []);
    } catch (error) {
      console.error('Error in fetchUsersAndProfiles:', error);
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserPermissions = async (
    userId: string, 
    allowedMarkets: string[], 
    allowedMarketTypes: string[], 
    isAdmin: boolean
  ) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          allowed_markets: allowedMarkets,
          allowed_market_types: allowedMarketTypes,
          is_admin: isAdmin
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating permissions:', error);
        toast({
          title: "Error",
          description: "Failed to update user permissions.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "User permissions updated successfully.",
      });

      await fetchUsersAndProfiles();
    } catch (error) {
      console.error('Error in updateUserPermissions:', error);
      toast({
        title: "Error",
        description: "Failed to update user permissions.",
        variant: "destructive",
      });
    }
  };

  const UserPermissionForm: React.FC<{ profile: UserProfile }> = ({ profile }) => {
    const [allowedMarkets, setAllowedMarkets] = useState<string[]>(profile.allowed_markets || []);
    const [allowedMarketTypes, setAllowedMarketTypes] = useState<string[]>(profile.allowed_market_types || []);
    const [isAdmin, setIsAdmin] = useState<boolean>(profile.is_admin || false);

    const handleMarketChange = (market: string, checked: boolean) => {
      if (checked) {
        setAllowedMarkets([...allowedMarkets, market]);
      } else {
        setAllowedMarkets(allowedMarkets.filter(m => m !== market));
      }
    };

    const handleMarketTypeChange = (marketType: string, checked: boolean) => {
      if (checked) {
        setAllowedMarketTypes([...allowedMarketTypes, marketType]);
      } else {
        setAllowedMarketTypes(allowedMarketTypes.filter(mt => mt !== marketType));
      }
    };

    const handleSave = () => {
      updateUserPermissions(profile.user_id, allowedMarkets, allowedMarketTypes, isAdmin);
      setSelectedUser(null);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`admin-${profile.id}`}
            checked={isAdmin}
            onCheckedChange={(checked) => setIsAdmin(checked as boolean)}
          />
          <Label htmlFor={`admin-${profile.id}`} className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Admin (Full Access)
          </Label>
        </div>

        {!isAdmin && (
          <>
            <Separator />
            
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Globe className="h-4 w-4" />
                Allowed Markets (empty = all markets)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_MARKETS.map((market) => (
                  <div key={market.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`market-${profile.id}-${market.value}`}
                      checked={allowedMarkets.includes(market.value)}
                      onCheckedChange={(checked) => handleMarketChange(market.value, checked as boolean)}
                    />
                    <Label htmlFor={`market-${profile.id}-${market.value}`} className="text-sm">
                      {market.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Truck className="h-4 w-4" />
                Allowed Market Types (empty = all types)
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {AVAILABLE_MARKET_TYPES.map((marketType) => (
                  <div key={marketType.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${profile.id}-${marketType.value}`}
                      checked={allowedMarketTypes.includes(marketType.value)}
                      onCheckedChange={(checked) => handleMarketTypeChange(marketType.value, checked as boolean)}
                    />
                    <Label htmlFor={`type-${profile.id}-${marketType.value}`} className="text-sm">
                      {marketType.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSave}>Save Changes</Button>
          <Button variant="outline" onClick={() => setSelectedUser(null)}>Cancel</Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>
          Manage user permissions for markets and market types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userProfiles.map((profile) => (
            <div key={profile.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {profile.first_name && profile.last_name 
                      ? `${profile.first_name} ${profile.last_name}` 
                      : profile.email || 'Unnamed User'
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {profile.email && (
                      <div>{profile.email}</div>
                    )}
                    {profile.is_admin ? (
                      <span className="flex items-center gap-1 mt-1">
                        <Shield className="h-3 w-3" />
                        Admin
                      </span>
                    ) : (
                      <span>
                        Markets: {profile.allowed_markets?.length === 0 ? 'All' : profile.allowed_markets?.join(', ') || 'All'} | 
                        Types: {profile.allowed_market_types?.length === 0 ? 'All' : profile.allowed_market_types?.join(', ') || 'All'}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUser(selectedUser === profile.id ? null : profile.id)}
                >
                  {selectedUser === profile.id ? 'Cancel' : 'Edit'}
                </Button>
              </div>
              
              {selectedUser === profile.id && (
                <div className="mt-4 pt-4 border-t">
                  <UserPermissionForm profile={profile} />
                </div>
              )}
            </div>
          ))}
          
          {userProfiles.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No user profiles found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};