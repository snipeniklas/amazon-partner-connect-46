import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send, Users, TestTube, AlertCircle, Globe } from "lucide-react";
import { getEmailTemplate, getAvailableEmailTemplates, generateFormUrl, getLanguageForMarket } from "@/config/emailTemplates";
import { getAvailableMarkets } from "@/config/marketConfigs";

interface Contact {
  id: string;
  company_name: string;
  email_address: string;
  contact_person_first_name?: string;
  contact_person_last_name?: string;
  email_sent: boolean;
  form_completed: boolean;
  market_type?: string;
  target_market?: string;
}

interface EmailSenderProps {
  contacts: Contact[];
  onEmailsSent: () => void;
}

export const EmailSender = ({ contacts, onEmailsSent }: EmailSenderProps) => {
  const [loading, setLoading] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [selectedTestContact, setSelectedTestContact] = useState<string>("");
  const [selectedMarketType, setSelectedMarketType] = useState<string>("van_transport");
  const [selectedTargetMarket, setSelectedTargetMarket] = useState<string>("germany");
  const { toast } = useToast();
  const { t } = useTranslation();

  // Get available markets
  const availableMarkets = getAvailableMarkets();
  const availableTemplates = getAvailableEmailTemplates();
  
  // Filter contacts by selected market and eligibility
  const eligibleContacts = contacts.filter(contact => {
    const matchesMarket = (!contact.market_type || contact.market_type === selectedMarketType) &&
                         (!contact.target_market || contact.target_market === selectedTargetMarket);
    return !contact.email_sent && matchesMarket;
  });
  
  // Get current email template
  const currentLanguage = getLanguageForMarket(selectedTargetMarket);
  const emailTemplate = getEmailTemplate(selectedMarketType, selectedTargetMarket, currentLanguage);
  
  // Generate preview text
  const getPreviewText = () => {
    if (!emailTemplate) return "Template nicht verfügbar";
    
    const name = "Max Mustermann";
    const benefits = emailTemplate.benefits.map(benefit => `• ${benefit}`).join('\n');
    
    return `${emailTemplate.greeting(name)}

${emailTemplate.intro}

${emailTemplate.body}

${benefits}

${emailTemplate.action}

[${emailTemplate.cta.toUpperCase()}]

${emailTemplate.closing}

${emailTemplate.signature}`;
  };

  const handleSendEmails = async (isTest: boolean = false) => {
    if (isTest && !selectedTestContact) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie einen Kontakt für den Test aus.",
        variant: "destructive",
      });
      return;
    }

    if (!isTest && eligibleContacts.length === 0) {
      toast({
        title: "Keine E-Mails zu versenden",
        description: "Alle Kontakte haben bereits E-Mails erhalten.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const contactsToEmail = isTest 
        ? contacts.filter(c => c.id === selectedTestContact)
        : eligibleContacts;

      // Call the send-email edge function
      const { data, error } = await supabase.functions.invoke('send-partner-email', {
        body: {
          contacts: contactsToEmail,
          isTest: isTest,
          marketType: selectedMarketType,
          targetMarket: selectedTargetMarket
        }
      });

      if (error) {
        throw error;
      }

      // Update contacts as email sent
      const contactIds = contactsToEmail.map(c => c.id);
      const { error: updateError } = await supabase
        .from('contacts')
        .update({ 
          email_sent: true, 
          email_sent_at: new Date().toISOString() 
        })
        .in('id', contactIds);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Erfolg",
        description: isTest 
          ? "Test-E-Mail wurde erfolgreich versendet."
          : `${contactsToEmail.length} E-Mails wurden erfolgreich versendet.`,
      });

      onEmailsSent();
      setSelectedTestContact("");
    } catch (error: any) {
      console.error('Email sending error:', error);
      toast({
        title: "Fehler",
        description: error.message || "E-Mail-Versand fehlgeschlagen.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Market Selection */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <h3 className="text-lg font-semibold">{t('emails:sender.marketSelection.title', 'Markt-Auswahl')}</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('emails:sender.marketSelection.marketType', 'Markttyp')}</Label>
                <Select value={selectedMarketType} onValueChange={setSelectedMarketType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="van_transport">Van Transport</SelectItem>
                    <SelectItem value="bicycle_delivery">Bicycle Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t('emails:sender.marketSelection.targetMarket', 'Zielmarkt')}</Label>
                <Select value={selectedTargetMarket} onValueChange={setSelectedTargetMarket}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedMarketType === "van_transport" 
                      ? availableMarkets.van_transport.map(market => (
                          <SelectItem key={market} value={market}>
                            {market.charAt(0).toUpperCase() + market.slice(1)}
                          </SelectItem>
                        ))
                      : availableMarkets.bicycle_delivery.map(market => (
                          <SelectItem key={market} value={market}>
                            {market.charAt(0).toUpperCase() + market.slice(1)}
                          </SelectItem>
                        ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {emailTemplate && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">
                  <strong>{t('emails:sender.marketSelection.selectedTemplate', 'Ausgewähltes Template')}:</strong> {emailTemplate.subject}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
              <div>
                <div className="text-lg sm:text-2xl font-bold">{contacts.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{t('emails:sender.statistics.total')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-amazon-orange shrink-0" />
              <div>
                <div className="text-lg sm:text-2xl font-bold text-amazon-orange">
                  {contacts.filter(c => c.email_sent).length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">{t('emails:sender.statistics.sent')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Send className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 shrink-0" />
              <div>
                <div className="text-lg sm:text-2xl font-bold text-green-600">
                  {eligibleContacts.length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">{t('emails:sender.statistics.ready')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Template Preview */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <h3 className="text-lg font-semibold">{t('emails:sender.preview.title')}</h3>
            </div>
            <div className="bg-muted p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs sm:text-sm whitespace-pre-wrap font-mono">
                {getPreviewText().replace('[FORMULAR_BUTTON]', '🔗 [Hier klicken zum Ausfüllen des Formulars]')}
              </pre>
            </div>
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-xs sm:text-sm text-amber-800">
                <div className="font-medium">{t('emails:sender.preview.note', 'Hinweis')}:</div>
                <div>{t('emails:sender.preview.formLinkNote', 'Der [FORMULAR_BUTTON] wird automatisch durch einen personalisierten, marktspezifischen Link ersetzt.')}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Email Section */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Test-E-Mail senden</h3>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Testen Sie den E-Mail-Versand mit einem ausgewählten Kontakt
            </div>
            
            <div className="space-y-3">
              <Label>Kontakt für Test auswählen</Label>
              <Select value={selectedTestContact} onValueChange={setSelectedTestContact}>
                <SelectTrigger>
                  <SelectValue placeholder={t('emails:sender.testEmail.selectContact', 'Kontakt auswählen...')} />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.company_name} ({contact.email_address})
                      {contact.email_sent && ` - ${t('emails:sender.testEmail.alreadySent', 'bereits versendet')}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
                <Button
                  onClick={() => handleSendEmails(true)}
                  disabled={loading || !selectedTestContact}
                  variant="outline"
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <TestTube className="h-4 w-4" />
                  {loading ? t('emails:sender.testEmail.sending', 'Sendet Test-E-Mail...') : t('emails:sender.testEmail.send', 'Test-E-Mail senden')}
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Email Section */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Alle E-Mails versenden</h3>
            </div>
            
            {eligibleContacts.length > 0 ? (
              <div className="space-y-4">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {t('emails:sender.bulkEmail.description', '{count} Kontakte werden eine E-Mail erhalten:', { count: eligibleContacts.length })}
                </div>
                
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {eligibleContacts.slice(0, 10).map(contact => (
                    <div key={contact.id} className="text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <Badge variant="outline" className="text-xs w-fit">
                        {contact.company_name}
                      </Badge>
                      <span className="text-muted-foreground truncate">{contact.email_address}</span>
                    </div>
                  ))}
                  {eligibleContacts.length > 10 && (
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      ... und {eligibleContacts.length - 10} weitere
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleSendEmails(false)}
                  disabled={loading}
                  className="flex items-center gap-2 w-full"
                >
                  <Send className="h-4 w-4" />
                  {loading ? t('emails:sender.bulkEmail.sending', 'Versendet E-Mails...') : t('emails:sender.bulkEmail.send', '{count} E-Mails versenden', { count: eligibleContacts.length })}
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                {t('emails:sender.bulkEmail.allSent', 'Alle Kontakte für den ausgewählten Markt haben bereits E-Mails erhalten.')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};