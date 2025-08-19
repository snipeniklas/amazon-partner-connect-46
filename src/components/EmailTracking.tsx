import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { 
  Mail, Eye, MousePointer, CheckCircle, XCircle, 
  Clock, AlertTriangle, TrendingUp, Calendar
} from "lucide-react";

interface EmailTrackingEvent {
  id: string;
  email_id: string;
  event_type: string;
  event_data: any;
  timestamp: string;
  created_at: string;
}

interface EmailTrackingProps {
  contactId: string;
  emailSent: boolean;
}

export const EmailTracking = ({ contactId, emailSent }: EmailTrackingProps) => {
  const [trackingEvents, setTrackingEvents] = useState<EmailTrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation('emails');

  useEffect(() => {
    const fetchTrackingData = async () => {
      if (!emailSent) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('email_tracking')
          .select('*')
          .eq('contact_id', contactId)
          .order('timestamp', { ascending: false });

        if (!error && data) {
          setTrackingEvents(data);
        }
      } catch (error) {
        console.error('Error fetching tracking data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();

    // Set up real-time subscription for tracking updates
    const channel = supabase
      .channel('email_tracking_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'email_tracking',
          filter: `contact_id=eq.${contactId}`
        },
        (payload) => {
          setTrackingEvents(prev => [payload.new as EmailTrackingEvent, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contactId, emailSent]);

  if (!emailSent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            {t('tracking.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <div className="text-sm">{t('tracking.noEmailSent')}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-amazon-blue" />
            {t('tracking.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amazon-orange mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'sent':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'opened':
        return <Eye className="h-4 w-4 text-amazon-orange" />;
      case 'clicked':
        return <MousePointer className="h-4 w-4 text-purple-500" />;
      case 'bounced':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'complained':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'delayed':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <Mail className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'opened':
        return 'bg-orange-100 text-orange-800';
      case 'clicked':
        return 'bg-purple-100 text-purple-800';
      case 'bounced':
        return 'bg-red-100 text-red-800';
      case 'complained':
        return 'bg-red-100 text-red-800';
      case 'delayed':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventLabel = (eventType: string) => {
    switch (eventType) {
      case 'sent':
        return t('tracking.events.sent');
      case 'delivered':
        return t('tracking.events.delivered');
      case 'opened':
        return t('tracking.events.opened');
      case 'clicked':
        return t('tracking.events.clicked');
      case 'bounced':
        return t('tracking.events.bounced');
      case 'complained':
        return t('tracking.events.complained');
      case 'delayed':
        return t('tracking.events.delayed');
      default:
        return eventType;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const locale = i18n.language === 'en' ? 'en-US' : 
                   i18n.language === 'fr' ? 'fr-FR' :
                   i18n.language === 'es' ? 'es-ES' :
                   i18n.language === 'it' ? 'it-IT' : 'de-DE';
                   
    return new Date(timestamp).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate engagement metrics
  const hasOpened = trackingEvents.some(e => e.event_type === 'opened');
  const hasClicked = trackingEvents.some(e => e.event_type === 'clicked');
  const wasDelivered = trackingEvents.some(e => e.event_type === 'delivered');
  const wasBounced = trackingEvents.some(e => e.event_type === 'bounced');

  const engagementScore = () => {
    let score = 0;
    if (wasDelivered) score += 25;
    if (hasOpened) score += 35;
    if (hasClicked) score += 40;
    return Math.min(score, 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-amazon-blue" />
          {t('tracking.titleWithEngagement')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Engagement Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-amazon-blue">
              {engagementScore()}%
            </div>
            <div className="text-xs text-muted-foreground">{t('tracking.engagement')}</div>
            <Progress value={engagementScore()} className="mt-2 h-1" />
          </div>

          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              {wasDelivered ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : wasBounced ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : (
                <Clock className="h-4 w-4 text-amber-500" />
              )}
            </div>
            <div className="text-xs text-muted-foreground">{t('tracking.delivery')}</div>
          </div>

          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              {hasOpened ? (
                <Eye className="h-4 w-4 text-amazon-orange" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {hasOpened ? t('tracking.opened') : t('tracking.notOpened')}
            </div>
          </div>

          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              {hasClicked ? (
                <MousePointer className="h-4 w-4 text-purple-500" />
              ) : (
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {hasClicked ? t('tracking.clicked') : t('tracking.notClicked')}
            </div>
          </div>
        </div>

        {/* Event Timeline */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t('tracking.history')}
          </h4>
          
          {trackingEvents.length > 0 ? (
            <div className="space-y-3">
              {trackingEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                  <div className="mt-1">
                    {getEventIcon(event.event_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-xs ${getEventColor(event.event_type)}`}>
                        {getEventLabel(event.event_type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                    
                    {/* Additional event details */}
                    {event.event_type === 'clicked' && event.event_data.clicked_link && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {t('tracking.details.link')} {event.event_data.clicked_link}
                      </div>
                    )}
                    
                    {event.event_type === 'bounced' && event.event_data.bounce_reason && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {t('tracking.details.reason')} {event.event_data.bounce_reason}
                      </div>
                    )}
                    
                    {event.event_type === 'delayed' && event.event_data.delay_reason && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {t('tracking.details.delayReason')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <div className="text-sm">{t('tracking.noData')}</div>
              <div className="text-xs">{t('tracking.autoCapture')}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};