import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback logic to prevent crash if environment variables are missing or placeholders
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return !url.includes('placeholder') && !url.includes('SUA_URL');
  } catch {
    return false;
  }
};

const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co';
const finalKey = (supabaseAnonKey && !supabaseAnonKey.includes('SUA_KEY')) ? supabaseAnonKey : 'placeholder';

export const supabase = createClient(finalUrl, finalKey);

export const auth = supabase.auth;

export type Property = {
  id: string;
  title: string;
  description: string;
  price: number;
  market_value?: number;
  city: string;
  neighborhood: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  parking_spots: number;
  area: number;
  type: 'house' | 'apartment' | 'land' | 'commercial';
  status: 'available' | 'sold' | 'rented';
  category: 'venda' | 'aluguel' | 'permuta' | 'empreendimento';
  featured: boolean;
  images: string[];
  views: number;
  created_at: string;
  updated_at: string;
};
