import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { User } from '@supabase/supabase-js';
import { chunkArray } from "@/lib/utils";
import { 
  Mail, 
  CheckCircle, 
  Eye, 
  MousePointer, 
  AlertTriangle,
  Timer,
  Calendar
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface EmailActivity {
  id: string;
  contact_id: string;
  company_name: string;
  email_address: string;
  event_type: string;
  timestamp: string;
  event_data: any;
}

interface LatestEmailActivitiesProps {
  user: User | null;
  contacts: any[];
}

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'sent':
      return Mail;
    case 'delivered':
      return CheckCircle;
    case 'opened':
      return Eye;
    case 'clicked':
      return MousePointer;
    case 'bounced':
      return AlertTriangle;
    case 'delayed':
      return Timer;
    default:
      return Calendar;
  }
};

const getEventColor = (eventType: string) => {
  switch (eventType) {
    case 'sent':
      return 'text-blue-600';
    case 'delivered':
      return 'text-green-600';
    case 'opened':
      return 'text-purple-600';
    case 'clicked':
      return 'text-orange-600';
    case 'bounced':
      return 'text-red-600';
    case 'delayed':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
};

const getEventBgColor = (eventType: string) => {
  switch (eventType) {
    case 'sent':
      return 'bg-blue-50';
    case 'delivered':
      return 'bg-green-50';
    case 'opened':
      return 'bg-purple-50';
    case 'clicked':
      return 'bg-orange-50';
    case 'bounced':
      return 'bg-red-50';
    case 'delayed':
      return 'bg-yellow-50';
    default:
      return 'bg-gray-50';
  }
};

export function LatestEmailActivities({ user, contacts }: LatestEmailActivitiesProps) {
  const { t, i18n } = useTranslation(['dashboard', 'emails']);
  const [activities, setActivities] = useState<EmailActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasAccessToContact, permissions } = useUserPermissions(user);

  useEffect(() => {
    fetchLatestActivities();
  }, [user, contacts]);

  const fetchLatestActivities = async () => {
    try {
      setLoading(true);

      const accessibleContacts = contacts.filter(contact => hasAccessToContact(contact));
      let trackingData: any[] = [];
      let contactsForLookup = accessibleContacts;

      // For admin users, fetch all email tracking data directly
      if (permissions.is_admin) {
        const { data, error } = await supabase
          .from('email_tracking')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(15);

        if (error) {
          console.error('Error fetching email tracking:', error);
          return;
        }

        trackingData = data || [];
        contactsForLookup = contacts; // Use all contacts for lookup
      } else if (accessibleContacts.length > 0) {
        const contactIds = accessibleContacts.map(contact => contact.id);
        
        // Split contact IDs into chunks to avoid URL length limits
        const chunks = chunkArray(contactIds, 100);
        const promises = chunks.map(chunk =>
          supabase
            .from('email_tracking')
            .select('*')
            .in('contact_id', chunk)
            .order('timestamp', { ascending: false })
        );
        
        const results = await Promise.all(promises);
        const allData = results.flatMap(result => result.data || []);
        
        // Sort by timestamp and limit to 15 most recent
        trackingData = allData
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 15);
      }

      // Enhance tracking data with contact information
      const activitiesWithContacts = trackingData.map(track => {
        const contact = contactsForLookup.find(c => c.id === track.contact_id);
        return {
          id: track.id,
          contact_id: track.contact_id,
          company_name: contact?.company_name || 'Unknown Company',
          email_address: contact?.email_address || 'Unknown Email',
          event_type: track.event_type,
          timestamp: track.timestamp,
          event_data: track.event_data,
        };
      });

      setActivities(activitiesWithContacts);
    } catch (error) {
      console.error('Error fetching latest email activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeTranslation = (eventType: string) => {
    const key = `emails:tracking.events.${eventType}`;
    const translated = t(key);
    return translated !== key ? translated : eventType;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard:activities.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3 animate-pulse">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard:activities.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {t('dashboard:activities.noData')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {t('dashboard:activities.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = getEventIcon(activity.event_type);
            const iconColor = getEventColor(activity.event_type);
            const bgColor = getEventBgColor(activity.event_type);
            
            return (
              <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg border border-muted">
                <div className={`p-2 rounded-full ${bgColor}`}>
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground truncate">
                      {activity.company_name}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${iconColor}`}>
                      {getEventTypeTranslation(activity.event_type)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.email_address}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { 
                      addSuffix: true,
                      locale: i18n.language === 'de' ? de : undefined 
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(activity.timestamp), 'HH:mm')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}