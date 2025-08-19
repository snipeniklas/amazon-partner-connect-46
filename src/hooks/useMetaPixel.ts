import { useEffect } from 'react';

interface MetaPixelParams {
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
  content_ids?: string[];
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  [key: string]: any;
}

export const useMetaPixel = (pixelCode: string | null) => {
  useEffect(() => {
    if (!pixelCode || typeof window === 'undefined') return;

    // Check if Meta Pixel is already loaded
    if ((window as any).fbq) return;

    try {
      // Extract pixel ID from the code
      const pixelIdMatch = pixelCode.match(/fbq\('init',\s*['"]([^'"]+)['"]/);
      if (!pixelIdMatch) {
        console.error('Invalid Meta Pixel code: No pixel ID found');
        return;
      }

      const pixelId = pixelIdMatch[1];

      // Load Facebook Pixel base code
      (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      // Initialize the pixel with the extracted ID
      (window as any).fbq('init', pixelId);
      
      // Track the initial PageView
      (window as any).fbq('track', 'PageView');

      console.log('Meta Pixel loaded successfully with ID:', pixelId);
    } catch (error) {
      console.error('Error loading Meta Pixel:', error);
    }
  }, [pixelCode]);

  // Return tracking functions
  const trackEvent = (eventName: string, parameters: MetaPixelParams = {}) => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      try {
        (window as any).fbq('track', eventName, parameters);
        console.log(`Meta Pixel event tracked: ${eventName}`, parameters);
      } catch (error) {
        console.error('Error tracking Meta Pixel event:', error);
      }
    } else {
      console.warn('Meta Pixel not loaded, cannot track event:', eventName);
    }
  };

  const trackCustomEvent = (eventName: string, parameters: MetaPixelParams = {}) => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      try {
        (window as any).fbq('trackCustom', eventName, parameters);
        console.log(`Meta Pixel custom event tracked: ${eventName}`, parameters);
      } catch (error) {
        console.error('Error tracking Meta Pixel custom event:', error);
      }
    } else {
      console.warn('Meta Pixel not loaded, cannot track custom event:', eventName);
    }
  };

  return {
    trackEvent,
    trackCustomEvent,
    // Standard event helpers
    trackLead: (params?: MetaPixelParams) => trackEvent('Lead', params),
    trackContact: (params?: MetaPixelParams) => trackEvent('Contact', params),
    trackCompleteRegistration: (params?: MetaPixelParams) => trackEvent('CompleteRegistration', params),
    trackSubmitApplication: (params?: MetaPixelParams) => trackEvent('SubmitApplication', params),
    trackViewContent: (params?: MetaPixelParams) => trackEvent('ViewContent', params),
  };
};