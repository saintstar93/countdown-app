import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '~/types/auth';
import { supabase } from '~/services/supabase';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      signIn: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) {
            set({ isLoading: false });
            return error.message;
          }
          const user: User = {
            id: data.user.id,
            email: data.user.email ?? email,
            createdAt: data.user.created_at,
          };
          set({ user, isAuthenticated: true, isLoading: false });
          return null;
        } catch {
          set({ isLoading: false });
          return 'Errore di rete';
        }
      },

      signUp: async (email, password) => {
        set({ isLoading: true });
        try {
          const { error } = await supabase.auth.signUp({ email, password });
          set({ isLoading: false });
          return error ? error.message : null;
        } catch {
          set({ isLoading: false });
          return 'Errore di rete';
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          await supabase.auth.signOut();
        } finally {
          set({ user: null, isAuthenticated: false, isLoading: false });
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
