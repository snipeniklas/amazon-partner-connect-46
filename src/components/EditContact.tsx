import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, X, Building, User, Mail, Phone, Globe, MapPin, FileText, MessageSquare } from "lucide-react";

interface Contact {
  id: string;
  company_name: string;
  email_address: string;
  company_address?: string;
  legal_form?: string;
  website?: string;
  contact_person_first_name?: string;
  contact_person_last_name?: string;
  contact_person_position?: string;
  phone_number?: string;
  additional_comments?: string;
}

interface EditContactProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const EditContact = ({ contact, isOpen, onClose, onSave }: EditContactProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Contact>({
    id: "",
    company_name: "",
    email_address: "",
    company_address: "",
    legal_form: "",
    website: "",
    contact_person_first_name: "",
    contact_person_last_name: "",
    contact_person_position: "",
    phone_number: "",
    additional_comments: ""
  });

  useEffect(() => {
    if (contact && isOpen) {
      setFormData({
        id: contact.id,
        company_name: contact.company_name || "",
        email_address: contact.email_address || "",
        company_address: contact.company_address || "",
        legal_form: contact.legal_form || "",
        website: contact.website || "",
        contact_person_first_name: contact.contact_person_first_name || "",
        contact_person_last_name: contact.contact_person_last_name || "",
        contact_person_position: contact.contact_person_position || "",
        phone_number: contact.phone_number || "",
        additional_comments: contact.additional_comments || ""
      });
    }
  }, [contact, isOpen]);

  const handleSave = async () => {
    if (!formData.company_name.trim() || !formData.email_address.trim()) {
      toast({
        title: "Fehler",
        description: "Unternehmensname und E-Mail-Adresse sind erforderlich.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('contacts')
        .update({
          company_name: formData.company_name.trim(),
          email_address: formData.email_address.trim(),
          company_address: formData.company_address?.trim() || null,
          legal_form: formData.legal_form?.trim() || null,
          website: formData.website?.trim() || null,
          contact_person_first_name: formData.contact_person_first_name?.trim() || null,
          contact_person_last_name: formData.contact_person_last_name?.trim() || null,
          contact_person_position: formData.contact_person_position?.trim() || null,
          phone_number: formData.phone_number?.trim() || null,
          additional_comments: formData.additional_comments?.trim() || null
        })
        .eq('id', formData.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Erfolg",
        description: "Kontakt wurde erfolgreich aktualisiert.",
      });

      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Speichern des Kontakts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof Contact, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-amazon-blue" />
            {t('contacts:form.editTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('contacts:form.editTitle')} {formData.company_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Unternehmensinformationen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                Unternehmensinformationen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">{t('forms:contactForm.fields.company')} *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => updateField('company_name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email_address">E-Mail-Adresse *</Label>
                  <Input
                    id="email_address"
                    type="email"
                    value={formData.email_address}
                    onChange={(e) => updateField('email_address', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legal_form">Rechtsform</Label>
                  <Input
                    id="legal_form"
                    value={formData.legal_form}
                    onChange={(e) => updateField('legal_form', e.target.value)}
                    placeholder="z.B. GmbH, AG, UG"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_address">Unternehmensadresse</Label>
                <Textarea
                  id="company_address"
                  value={formData.company_address}
                  onChange={(e) => updateField('company_address', e.target.value)}
                  rows={3}
                  placeholder="Straße, Hausnummer, PLZ Ort"
                />
              </div>
            </CardContent>
          </Card>

          {/* Kontaktperson */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Ansprechpartner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_person_first_name">Vorname</Label>
                  <Input
                    id="contact_person_first_name"
                    value={formData.contact_person_first_name}
                    onChange={(e) => updateField('contact_person_first_name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_person_last_name">Nachname</Label>
                  <Input
                    id="contact_person_last_name"
                    value={formData.contact_person_last_name}
                    onChange={(e) => updateField('contact_person_last_name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_person_position">Position</Label>
                  <Input
                    id="contact_person_position"
                    value={formData.contact_person_position}
                    onChange={(e) => updateField('contact_person_position', e.target.value)}
                    placeholder="z.B. Geschäftsführer, Logistikleiter"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Telefonnummer</Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => updateField('phone_number', e.target.value)}
                    placeholder="+49 xxx xxxx"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Zusätzliche Kommentare
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="additional_comments">Kommentare</Label>
                <Textarea
                  id="additional_comments"
                  value={formData.additional_comments}
                  onChange={(e) => updateField('additional_comments', e.target.value)}
                  rows={4}
                  placeholder="Zusätzliche Informationen oder Kommentare..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            {t('common:buttons.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-amazon-blue hover:bg-amazon-blue/90">
            <Save className="h-4 w-4 mr-2" />
            {loading ? t('common:buttons.loading') : t('common:buttons.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};