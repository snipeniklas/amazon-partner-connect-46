import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { User } from '@supabase/supabase-js';
import { FileCheck, Building } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { de, enUS, es, fr, it } from 'date-fns/locale';

interface FormSubmission {
  id: string;
  company_name: string;
  email_address: string;
  form_completed_at: string;
  target_market: string;
  market_type: string;
}

interface LatestFormSubmissionsProps {
  user: User | null;
  contacts: any[];
}

export function LatestFormSubmissions({ user, contacts }: LatestFormSubmissionsProps) {
  const { t, i18n } = useTranslation(['dashboard', 'forms']);
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasAccessToContact } = useUserPermissions(user);

  useEffect(() => {
    fetchLatestFormSubmissions();
  }, [user, contacts]);

  const getDateLocale = () => {
    switch (i18n.language) {
      case 'de': return de;
      case 'es': return es;
      case 'fr': return fr;
      case 'it': return it;
      default: return enUS;
    }
  };

  const getMarketIcon = (targetMarket: string, marketType: string) => {
    const marketIcons: { [key: string]: string } = {
      'germany': '🇩🇪',
      'uk': '🇬🇧',
      'ireland': '🇮🇪',
      'france': '🇫🇷',
      'spain': '🇪🇸',
      'italy': '🇮🇹',
    };

    const typeIcons: { [key: string]: string } = {
      'van_transport': '🚐',
      'bicycle_delivery': '🚲',
    };

    return marketIcons[targetMarket] || typeIcons[marketType] || '📋';
  };

  const fetchLatestFormSubmissions = async () => {
    try {
      setLoading(true);

      // Filter contacts that have completed forms and user has access to
      const accessibleFormSubmissions = contacts
        .filter(contact => 
          contact.form_completed && 
          contact.form_completed_at && 
          hasAccessToContact(contact)
        )
        .sort((a, b) => new Date(b.form_completed_at).getTime() - new Date(a.form_completed_at).getTime())
        .slice(0, 5)
        .map(contact => ({
          id: contact.id,
          company_name: contact.company_name,
          email_address: contact.email_address,
          form_completed_at: contact.form_completed_at,
          target_market: contact.target_market,
          market_type: contact.market_type,
        }));

      setFormSubmissions(accessibleFormSubmissions);
    } catch (error) {
      console.error('Error fetching latest form submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            <Skeleton className="h-5 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          {t('dashboard:forms.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {formSubmissions.length === 0 ? (
          <div className="text-center py-8">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {t('dashboard:forms.noData')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {formSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-sm">
                    {getMarketIcon(submission.target_market, submission.market_type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {submission.company_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mb-2">
                    {submission.email_address}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {t(`forms:marketTypes.${submission.market_type}`)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {t(`forms:markets.${submission.target_market}`)}
                    </Badge>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard:forms.submitted')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(submission.form_completed_at), {
                      addSuffix: true,
                      locale: getDateLocale(),
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}