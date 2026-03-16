import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as AppleAuthentication from 'expo-apple-authentication';
import type { User } from '~/types/auth';
import { supabase } from '~/services/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useEventsStore } from '~/store/eventsStore';
import { useSettingsStore } from '~/store/settingsStore';
import { en } from '~/i18n/translations/en';
import { it } from '~/i18n/translations/it';

function getT() {
  const lang = useSettingsStore.getState().language;
  return lang === 'it' ? it : en;
}

WebBrowser.maybeCompleteAuthSession();

function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    displayName: supabaseUser.user_metadata?.display_name as string | undefined,
    avatarUrl: supabaseUser.user_metadata?.avatar_url as string | undefined,
    createdAt: supabaseUser.created_at,
  };
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, displayName?: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<string | null>;
  signInWithApple: () => Promise<string | null>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isInitialized: false,

      initialize: async () => {
        if (get().isInitialized) return;
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            set({ user: mapSupabaseUser(session.user), isAuthenticated: true, isInitialized: true });
          } else {
            set({ user: null, isAuthenticated: false, isInitialized: true });
          }
        } catch {
          set({ user: null, isAuthenticated: false, isInitialized: true });
        }
      },

      signIn: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) {
            set({ isLoading: false });
            return error.message;
          }
          set({ user: mapSupabaseUser(data.user), isAuthenticated: true, isLoading: false });
          return null;
        } catch {
          set({ isLoading: false });
          return getT().auth.errors.networkError;
        }
      },

      signUp: async (email, password, displayName) => {
        set({ isLoading: true });
        try {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: displayName ? { data: { display_name: displayName } } : undefined,
          });
          set({ isLoading: false });
          return error ? error.message : null;
        } catch {
          set({ isLoading: false });
          return getT().auth.errors.networkError;
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          await supabase.auth.signOut();
        } finally {
          // Clear other users' data from memory and AsyncStorage
          useEventsStore.getState().reset();
          useSettingsStore.getState().setThemeMode('system');
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      signInWithGoogle: async () => {
        set({ isLoading: true });
        try {
          const redirectUrl = Linking.createURL('/');
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
          });
          if (error || !data.url) {
            set({ isLoading: false });
            return error?.message ?? getT().auth.errors.googleSignIn;
          }
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
          if (result.type === 'success') {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(result.url);
            if (exchangeError) {
              set({ isLoading: false });
              return exchangeError.message;
            }
          }
          set({ isLoading: false });
          return null;
        } catch {
          set({ isLoading: false });
          return getT().auth.errors.networkError;
        }
      },

      signInWithApple: async () => {
        set({ isLoading: true });
        try {
          // iOS: native Apple Authentication module (id_token flow)
          if (Platform.OS === 'ios') {
            const isAvailable = await AppleAuthentication.isAvailableAsync();
            if (!isAvailable) {
              set({ isLoading: false });
              return getT().auth.errors.appleNotAvailable;
            }
            const credential = await AppleAuthentication.signInAsync({
              requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
              ],
            });
            if (!credential.identityToken) {
              set({ isLoading: false });
              return getT().auth.errors.appleInvalidToken;
            }
            const { error } = await supabase.auth.signInWithIdToken({
              provider: 'apple',
              token: credential.identityToken,
            });
            set({ isLoading: false });
            if (error) {
              // Expo Go uses host.exp.Exponent as bundle ID — Apple Sign In
              // requires a production/dev build with the real bundle identifier.
              if (error.message.includes('Unacceptable audience')) {
                return 'Apple Sign In non funziona in Expo Go. Usa una build di sviluppo (eas build --profile development).';
              }
              return error.message;
            }
            return null;
          }

          // Android / Web: OAuth PKCE flow via browser
          const redirectUrl = Linking.createURL('/');
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'apple',
            options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
          });
          if (error || !data.url) {
            set({ isLoading: false });
            return error?.message ?? getT().auth.errors.appleSignIn;
          }
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
          if (result.type === 'success') {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(result.url);
            if (exchangeError) {
              set({ isLoading: false });
              return exchangeError.message;
            }
          }
          set({ isLoading: false });
          return null;
        } catch (err: unknown) {
          set({ isLoading: false });
          if (Platform.OS === 'ios') {
            const appleError = err as { code?: string };
            if (appleError.code === 'ERR_REQUEST_CANCELED') return null; // User cancelled
          }
          return getT().auth.errors.appleSignIn;
        }
      },

      setUser: (user) => set({ user, isAuthenticated: user !== null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
