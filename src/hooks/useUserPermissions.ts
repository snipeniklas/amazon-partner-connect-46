import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { getAvailableMarkets } from '@/config/marketConfigs';

export interface UserPermissions {
  allowed_markets: string[];
  allowed_market_types: string[];
  is_admin: boolean;
}

export interface UserProfile {
  id: string;
  user_id: string;
  allowed_markets: string[];
  allowed_market_types: string[];
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export const useUserPermissions = (user: User | null) => {
  const [permissions, setPermissions] = useState<UserPermissions>({
    allowed_markets: [],
    allowed_market_types: [],
    is_admin: true // Default to admin for backward compatibility
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user) {
        setPermissions({
          allowed_markets: [],
          allowed_market_types: [],
          is_admin: false
        });
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('allowed_markets, allowed_market_types, is_admin')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user permissions:', error);
          // Default to admin for backward compatibility
          setPermissions({
            allowed_markets: [],
            allowed_market_types: [],
            is_admin: true
          });
        } else if (data) {
          setPermissions({
            allowed_markets: data.allowed_markets || [],
            allowed_market_types: data.allowed_market_types || [],
            is_admin: data.is_admin || false
          });
        } else {
          // No profile exists, create one with admin permissions
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: user.id,
              is_admin: true,
              allowed_markets: [],
              allowed_market_types: []
            });

          if (!insertError) {
            setPermissions({
              allowed_markets: [],
              allowed_market_types: [],
              is_admin: true
            });
          }
        }
      } catch (error) {
        console.error('Error in fetchPermissions:', error);
        setPermissions({
          allowed_markets: [],
          allowed_market_types: [],
          is_admin: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user]);

  const hasAccessToMarket = (market: string) => {
    if (permissions.is_admin) return true;
    if (permissions.allowed_markets.length === 0) return true;
    return permissions.allowed_markets.includes(market);
  };

  const hasAccessToMarketType = (marketType: string) => {
    if (permissions.is_admin) return true;
    if (permissions.allowed_market_types.length === 0) return true;
    return permissions.allowed_market_types.includes(marketType);
  };

  const hasAccessToContact = (contact: { target_market?: string; market_type?: string }) => {
    if (permissions.is_admin) return true;
    
    const marketAccess = !contact.target_market || hasAccessToMarket(contact.target_market);
    const typeAccess = !contact.market_type || hasAccessToMarketType(contact.market_type);
    
    return marketAccess && typeAccess;
  };

  const getAccessibleMarkets = () => {
    if (permissions.is_admin || permissions.allowed_markets.length === 0) {
      const availableMarkets = getAvailableMarkets();
      return [...availableMarkets.van_transport, ...availableMarkets.bicycle_delivery];
    }
    return permissions.allowed_markets;
  };

  const getAccessibleMarketTypes = () => {
    if (permissions.is_admin || permissions.allowed_market_types.length === 0) {
      return ['van_transport', 'bicycle_delivery'];
    }
    return permissions.allowed_market_types;
  };

  return {
    permissions,
    loading,
    hasAccessToMarket,
    hasAccessToMarketType,
    hasAccessToContact,
    getAccessibleMarkets,
    getAccessibleMarketTypes
  };
};