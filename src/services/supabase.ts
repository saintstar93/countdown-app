import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
  console.error('Supabase URL mancante o non valida nel file .env');
}

if (!supabaseAnonKey || supabaseAnonKey.startsWith('sb_publishable_')) {
  console.error('Supabase Anon Key mancante o non valida nel file .env (deve essere un JWT che inizia con eyJ...)');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});
