import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { User } from '@supabase/supabase-js';
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
      
      // Use the same logic as ContactsList for consistent numbers
      const totalContacts = accessibleContacts.length;
      
      // Count emails sent and forms completed from contact flags
      const emailsSent = accessibleContacts.filter(contact => contact.email_sent).length;
      const formsCompleted = accessibleContacts.filter(contact => contact.form_completed).length;
      
      // Get ALL tracking data from email_tracking table - count UNIQUE CONTACTS, not events
      let emailsDelivered = 0;
      let emailsOpened = 0;
      let emailsClicked = 0;
      let emailsBounced = 0;
      let emailsDelayed = 0;
      
      if (accessibleContacts.length > 0) {
        const contactIds = accessibleContacts.map(contact => contact.id);
        
        // Get unique contacts for each event type using DISTINCT count
        const { data: deliveredData } = await supabase
          .from('email_tracking')
          .select('contact_id')
          .in('contact_id', contactIds)
          .eq('event_type', 'delivered');
        
        const { data: openedData } = await supabase
          .from('email_tracking')
          .select('contact_id')
          .in('contact_id', contactIds)
          .eq('event_type', 'opened');
        
        const { data: clickedData } = await supabase
          .from('email_tracking')
          .select('contact_id')
          .in('contact_id', contactIds)
          .eq('event_type', 'clicked');
        
        const { data: bouncedData } = await supabase
          .from('email_tracking')
          .select('contact_id')
          .in('contact_id', contactIds)
          .eq('event_type', 'bounced');
        
        const { data: delayedData } = await supabase
          .from('email_tracking')
          .select('contact_id')
          .in('contact_id', contactIds)
          .eq('event_type', 'delayed');
        
        // Count unique contacts (not events)
        emailsDelivered = deliveredData ? new Set(deliveredData.map(r => r.contact_id)).size : 0;
        emailsOpened = openedData ? new Set(openedData.map(r => r.contact_id)).size : 0;
        emailsClicked = clickedData ? new Set(clickedData.map(r => r.contact_id)).size : 0;
        emailsBounced = bouncedData ? new Set(bouncedData.map(r => r.contact_id)).size : 0;
        emailsDelayed = delayedData ? new Set(delayedData.map(r => r.contact_id)).size : 0;
      }
      
      // Rate calculations - use sent emails from contact flags as base
      const deliveryRate = emailsSent > 0 ? (emailsDelivered / emailsSent) * 100 : 0;
      const openRate = emailsDelivered > 0 ? (emailsOpened / emailsDelivered) * 100 : 0;
      const clickRate = emailsOpened > 0 ? (emailsClicked / emailsOpened) * 100 : 0;
      
      // Calculated metrics (same as ContactsList)
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

      console.log('📊 Dashboard Metrics (Fixed - UNIQUE CONTACTS):', finalMetrics);
      console.log('📧 Unique contacts: delivered:', emailsDelivered, 'opened:', emailsOpened, 'clicked:', emailsClicked);
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