import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { User } from '@supabase/supabase-js';
import { chunkArray } from "@/lib/utils";
import { 
  Users, 
  Mail, 
  CheckCircle, 
  Eye, 
  MousePointer, 
  FileCheck, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  Timer,
  Percent
} from "lucide-react";

interface DashboardOverviewProps {
  user: User | null;
  contacts: any[];
}

interface DashboardMetrics {
  totalContacts: number;
  emailsSent: number;
  emailsDelivered: number;
  emailsOpened: number;
  emailsClicked: number;
  emailsBounced: number;
  emailsDelayed: number;
  formsCompleted: number;
  awaitingResponse: number;
  conversionRate: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

export function DashboardOverview({ user, contacts }: DashboardOverviewProps) {
  const { t } = useTranslation(['dashboard']);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalContacts: 0,
    emailsSent: 0,
    emailsDelivered: 0,
    emailsOpened: 0,
    emailsClicked: 0,
    emailsBounced: 0,
    emailsDelayed: 0,
    formsCompleted: 0,
    awaitingResponse: 0,
    conversionRate: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const { hasAccessToContact, permissions } = useUserPermissions(user);

  useEffect(() => {
    fetchDashboardMetrics();
  }, [user, contacts]);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);

      // Filter contacts based on user permissions
      const accessibleContacts = contacts.filter(contact => hasAccessToContact(contact));
      
      let emailTrackingData: any[] = [];
      let totalEmailsSent = 0;
      
      // For admin users, fetch all email tracking data directly
      if (permissions.is_admin) {
        const { data: trackingData } = await supabase
          .from('email_tracking')
          .select('*');
        
        emailTrackingData = trackingData || [];
      } else if (accessibleContacts.length > 0) {
        const contactIds = accessibleContacts.map(contact => contact.id);
        
        // Split contact IDs into chunks to avoid URL length limits
        const chunks = chunkArray(contactIds, 100);
        const promises = chunks.map(chunk =>
          supabase
            .from('email_tracking')
            .select('*')
            .in('contact_id', chunk)
        );
        
        const results = await Promise.all(promises);
        emailTrackingData = results.flatMap(result => result.data || []);
      }
      
      totalEmailsSent = emailTrackingData.filter(event => event.event_type === 'sent').length;

      // Calculate metrics
      const totalContacts = accessibleContacts.length || contacts.length;
      const emailsSent = totalEmailsSent || accessibleContacts.filter(contact => contact.email_sent).length;
      const formsCompleted = accessibleContacts.length > 0 
        ? accessibleContacts.filter(contact => contact.form_completed).length
        : contacts.filter(contact => contact.form_completed).length;
      
      // Email tracking metrics
      const emailsDelivered = emailTrackingData.filter(event => event.event_type === 'delivered').length;
      const emailsOpened = emailTrackingData.filter(event => event.event_type === 'opened').length;
      const emailsClicked = emailTrackingData.filter(event => event.event_type === 'clicked').length;
      const emailsBounced = emailTrackingData.filter(event => event.event_type === 'bounced').length;
      const emailsDelayed = emailTrackingData.filter(event => event.event_type === 'delayed').length;
      
      // Rate calculations - use sent emails from tracking data as base
      const deliveryRate = emailsSent > 0 ? (emailsDelivered / emailsSent) * 100 : 0;
      const openRate = emailsDelivered > 0 ? (emailsOpened / emailsDelivered) * 100 : 0;
      const clickRate = emailsOpened > 0 ? (emailsClicked / emailsOpened) * 100 : 0;
      
      // Calculated metrics
      const awaitingResponse = totalContacts - formsCompleted;
      const conversionRate = emailsSent > 0 ? (formsCompleted / emailsSent) * 100 : 0;

      const finalMetrics = {
        totalContacts,
        emailsSent,
        emailsDelivered,
        emailsOpened,
        emailsClicked,
        emailsBounced,
        emailsDelayed,
        formsCompleted,
        awaitingResponse,
        conversionRate,
        deliveryRate,
        openRate,
        clickRate,
      };

      setMetrics(finalMetrics);
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const metricCards = [
    {
      title: t('dashboard:metrics.totalContacts'),
      value: metrics.totalContacts,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: t('dashboard:metrics.emailsSent'),
      value: metrics.emailsSent,
      icon: Mail,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: t('dashboard:metrics.emailsDelivered'),
      value: metrics.emailsDelivered,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: t('dashboard:metrics.emailsOpened'),
      value: metrics.emailsOpened,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: t('dashboard:metrics.emailsClicked'),
      value: metrics.emailsClicked,
      icon: MousePointer,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: t('dashboard:metrics.formsCompleted'),
      value: metrics.formsCompleted,
      icon: FileCheck,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      title: t('dashboard:metrics.awaitingResponse'),
      value: metrics.awaitingResponse,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: t('dashboard:metrics.emailsBounced'),
      value: metrics.emailsBounced,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: t('dashboard:metrics.emailsDelayed'),
      value: metrics.emailsDelayed,
      icon: Timer,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: t('dashboard:metrics.deliveryRate'),
      value: `${metrics.deliveryRate.toFixed(1)}%`,
      icon: Percent,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: t('dashboard:metrics.openRate'),
      value: `${metrics.openRate.toFixed(1)}%`,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: t('dashboard:metrics.clickRate'),
      value: `${metrics.clickRate.toFixed(1)}%`,
      icon: MousePointer,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: t('dashboard:metrics.conversionRate'),
      value: `${metrics.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {metricCards.map((metric, index) => (
        <Card 
          key={index} 
          className="hover:shadow-lg transition-all duration-300 border-0 shadow-md"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metric.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}