import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonDE from '../locales/de/common.json';
import commonEN from '../locales/en/common.json';
import commonFR from '../locales/fr/common.json';
import commonES from '../locales/es/common.json';
import commonIT from '../locales/it/common.json';

import authDE from '../locales/de/auth.json';
import authEN from '../locales/en/auth.json';
import authFR from '../locales/fr/auth.json';
import authES from '../locales/es/auth.json';
import authIT from '../locales/it/auth.json';

import dashboardDE from '../locales/de/dashboard.json';
import dashboardEN from '../locales/en/dashboard.json';
import dashboardFR from '../locales/fr/dashboard.json';
import dashboardES from '../locales/es/dashboard.json';
import dashboardIT from '../locales/it/dashboard.json';

import formsDE from '../locales/de/forms.json';
import formsEN from '../locales/en/forms.json';
import formsFR from '../locales/fr/forms.json';
import formsES from '../locales/es/forms.json';
import formsIT from '../locales/it/forms.json';

import contactsDE from '../locales/de/contacts.json';
import contactsEN from '../locales/en/contacts.json';
import contactsFR from '../locales/fr/contacts.json';
import contactsES from '../locales/es/contacts.json';
import contactsIT from '../locales/it/contacts.json';

import emailsDE from '../locales/de/emails.json';
import emailsEN from '../locales/en/emails.json';
import emailsFR from '../locales/fr/emails.json';
import emailsES from '../locales/es/emails.json';
import emailsIT from '../locales/it/emails.json';

const resources = {
  de: {
    common: commonDE,
    auth: authDE,
    dashboard: dashboardDE,
    forms: formsDE,
    contacts: contactsDE,
    emails: emailsDE,
  },
  en: {
    common: commonEN,
    auth: authEN,
    dashboard: dashboardEN,
    forms: formsEN,
    contacts: contactsEN,
    emails: emailsEN,
  },
  fr: {
    common: commonFR,
    auth: authFR,
    dashboard: dashboardFR,
    forms: formsFR,
    contacts: contactsFR,
    emails: emailsFR,
  },
  es: {
    common: commonES,
    auth: authES,
    dashboard: dashboardES,
    forms: formsES,
    contacts: contactsES,
    emails: emailsES,
  },
  it: {
    common: commonIT,
    auth: authIT,
    dashboard: dashboardIT,
    forms: formsIT,
    contacts: contactsIT,
    emails: emailsIT,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'de',
    lng: 'de',
    
    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
  });

export default i18n;