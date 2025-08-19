import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getAvailableMarkets } from "@/config/marketConfigs";

interface ContactFormProps {
  onSuccess: () => void;
}

import { useMetaPixel } from "@/hooks/useMetaPixel";
export const ContactForm = ({ onSuccess }: ContactFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Meta Pixel tracking - get pixel code for current market combination
  const [metaPixelCode, setMetaPixelCode] = useState<string | null>(null);
  const { trackLead, trackContact } = useMetaPixel(metaPixelCode);

  const [formData, setFormData] = useState({
    company_name: "",
    email_address: "",
    company_address: "",
    legal_form: "",
    website: "",
    contact_person_first_name: "",
    contact_person_last_name: "",
    contact_person_position: "",
    phone_number: "",
    market_type: "van_transport",
    target_market: "germany"
  });

  const availableMarkets = getAvailableMarkets();

  // Fetch Meta Pixel code when market selection changes
  useEffect(() => {
    const fetchMetaPixel = async () => {
      try {
        const { data, error } = await supabase
          .from('meta_pixel_settings')
          .select('pixel_code')
          .eq('market_type', formData.market_type)
          .eq('target_market', formData.target_market)
          .single();

        if (!error && data) {
          setMetaPixelCode(data.pixel_code);
        }
      } catch (error) {
        console.error('Error fetching Meta Pixel code:', error);
      }
    };

    fetchMetaPixel();
  }, [formData.market_type, formData.target_market]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: t('common:messages.error'),
          description: t('auth:signInError'),
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('contacts')
        .insert([{
          ...formData,
          user_id: sessionData.session.user.id,
        }]);

      if (error) {
        throw error;
      }

      toast({
        title: t('common:messages.success'),
        description: t('dashboard:contacts.added'),
      });

      // Track successful contact creation
      trackContact({
        content_name: `Contact Created - ${formData.company_name}`,
        content_category: 'contact_creation',
        value: 1,
        market_type: formData.market_type,
        target_market: formData.target_market
      });

      // Reset form
      setFormData({
        company_name: "",
        email_address: "",
        company_address: "",
        legal_form: "",
        website: "",
        contact_person_first_name: "",
        contact_person_last_name: "",
        contact_person_position: "",
        phone_number: "",
        market_type: "van_transport",
        target_market: "germany"
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Kontakt konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset target market when market type changes
      ...(field === 'market_type' ? { target_market: availableMarkets[value as keyof typeof availableMarkets][0] } : {})
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Required Fields */}
        <div className="space-y-2">
          <Label htmlFor="company_name">
            {t('forms:contactForm.fields.company')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="company_name"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email_address">
            {t('forms:contactForm.fields.email')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email_address"
            name="email_address"
            type="email"
            value={formData.email_address}
            onChange={handleChange}
            required
          />
        </div>

        {/* Market Selection */}
        <div className="space-y-2">
          <Label htmlFor="market_type">Market Type <span className="text-destructive">*</span></Label>
          <Select value={formData.market_type} onValueChange={(value) => handleSelectChange('market_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select market type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="van_transport">Van/Transport</SelectItem>
              <SelectItem value="bicycle_delivery">Bicycle Delivery</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target_market">Target Market <span className="text-destructive">*</span></Label>
          <Select value={formData.target_market} onValueChange={(value) => handleSelectChange('target_market', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select target market" />
            </SelectTrigger>
            <SelectContent>
              {availableMarkets[formData.market_type as keyof typeof availableMarkets]?.map((market) => (
                <SelectItem key={market} value={market}>
                  {market.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Optional Fields */}
        <div className="space-y-2">
          <Label htmlFor="company_address">Adresse des Unternehmens</Label>
          <Textarea
            id="company_address"
            name="company_address"
            value={formData.company_address}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="legal_form">Rechtsform</Label>
          <Input
            id="legal_form"
            name="legal_form"
            value={formData.legal_form}
            onChange={handleChange}
            placeholder="z.B. GmbH, AG, UG, OHG, Einzelunternehmen"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Webseite des Unternehmens</Label>
          <Input
            id="website"
            name="website"
            type="url"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_person_first_name">Kontaktperson Vorname</Label>
          <Input
            id="contact_person_first_name"
            name="contact_person_first_name"
            value={formData.contact_person_first_name}
            onChange={handleChange}
            placeholder="Vorname"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_person_last_name">Kontaktperson Nachname</Label>
          <Input
            id="contact_person_last_name"
            name="contact_person_last_name"
            value={formData.contact_person_last_name}
            onChange={handleChange}
            placeholder="Nachname"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_person_position">Position der Kontaktperson</Label>
          <Input
            id="contact_person_position"
            name="contact_person_position"
            value={formData.contact_person_position}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone_number">Telefonnummer</Label>
          <Input
            id="phone_number"
            name="phone_number"
            type="tel"
            value={formData.phone_number}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? t('common:buttons.loading') : t('common:buttons.add')}
        </Button>
      </div>
    </form>
  );
};