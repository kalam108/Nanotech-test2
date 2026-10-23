import dotenv from 'dotenv';

dotenv.config();

export const PORT = Number(process.env.PORT) || 5000;
export const APP_URL = process.env.APP_URL || 'http://localhost:3000';
export const SUPERADMIN_DOMAIN = process.env.SUPERADMIN_DOMAIN || 'kalamkumar.com.np';

export const getGoogleApiKey = (): string | undefined => {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_CLOUD_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY
  );
};

export const SUPABASE_CONFIG = {
  url: process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};
