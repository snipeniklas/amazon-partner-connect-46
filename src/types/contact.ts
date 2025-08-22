export interface ContactMapData {
  id: string;
  company_name: string;
  company_address?: string;
  operating_cities?: string[];
  market_type?: string;
  target_market?: string;
  email_sent: boolean;
  form_completed: boolean;
  latitude: number;
  longitude: number;
  full_time_drivers?: number;
  transporter_count?: number;
  bicycle_count?: number;
  [key: string]: any;
}