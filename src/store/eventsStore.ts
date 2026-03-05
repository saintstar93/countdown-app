import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Event, Tag } from '~/types/event';
import { MAX_EVENTS, MAX_MEMORIES } from '~/constants/config';
import { isPastEvent } from '~/utils/countdown';
import {
  dbFetchEvents,
  dbFetchTags,
  dbCreateEvent,
  dbUpdateEvent,
  dbDeleteEvent,
  dbPromoteToMemory,
  dbCreateTag,
} from '~/services/database';

interface EventsStore {
  events: Event[];
  memories: Event[];
  userTags: Tag[];
  isLoading: boolean;
  error: string | null;

  /** Load events + tags from Supabase (called after login) */
  loadFromSupabase: (userId: string) => Promise<void>;
  /** Returns error string or null on success */
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string | null>;
  removeEvent: (id: string) => Promise<string | null>;
  updateEvent: (
    id: string,
    updates: Partial<Omit<Event, 'id' | 'createdAt' | 'userId'>>,
  ) => Promise<string | null>;
  /** Save new tag to Supabase and add to userTags, returns the saved Tag or null */
  addTag: (userId: string, tag: Omit<Tag, 'id'>) => Promise<Tag | null>;
  checkAndPromoteExpiredEvents: () => Promise<void>;
  syncFromSupabase: (events: Event[]) => void;
  clearError: () => void;
}

export const useEventsStore = create<EventsStore>()(
  persist(
    (set, get) => ({
      events: [],
      memories: [],
      userTags: [],
      isLoading: false,
      error: null,

      loadFromSupabase: async (userId) => {
        set({ isLoading: true, error: null });
        const [eventsRes, tagsRes] = await Promise.all([
          dbFetchEvents(userId),
          dbFetchTags(userId),
        ]);

        if (eventsRes.error || tagsRes.error) {
          set({ isLoading: false, error: eventsRes.error ?? tagsRes.error });
          return;
        }

        const all = eventsRes.data ?? [];
        const active = all
          .filter((e) => !isPastEvent(e.date))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const memories = all
          .filter((e) => isPastEvent(e.date))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, MAX_MEMORIES);

        set({ events: active, memories, userTags: tagsRes.data ?? [], isLoading: false });
      },

      addEvent: async (eventData) => {
        const { events } = get();
        if (events.length >= MAX_EVENTS) {
          return `Puoi avere massimo ${MAX_EVENTS} eventi attivi`;
        }
        set({ isLoading: true });
        const { data, error } = await dbCreateEvent(eventData);
        if (error || !data) {
          set({ isLoading: false, error });
          return error ?? 'Errore sconosciuto';
        }
        set((state) => ({
          isLoading: false,
          events: [...state.events, data].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          ),
        }));
        return null;
      },

      removeEvent: async (id) => {
        set({ isLoading: true });
        const { error } = await dbDeleteEvent(id);
        if (error) {
          set({ isLoading: false, error });
          return error;
        }
        set((state) => ({
          isLoading: false,
          events: state.events.filter((e) => e.id !== id),
          memories: state.memories.filter((e) => e.id !== id),
        }));
        return null;
      },

      updateEvent: async (id, updates) => {
        set({ isLoading: true });
        const { data, error } = await dbUpdateEvent(id, updates);
        if (error || !data) {
          set({ isLoading: false, error });
          return error ?? 'Errore sconosciuto';
        }
        set((state) => ({
          isLoading: false,
          events: state.events
            .map((e) => (e.id === id ? data : e))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        }));
        return null;
      },

      addTag: async (userId, tagData) => {
        const { data, error } = await dbCreateTag(userId, tagData);
        if (error || !data) return null;
        set((state) => ({ userTags: [...state.userTags, data] }));
        return data;
      },

      checkAndPromoteExpiredEvents: async () => {
        const { events } = get();
        const expired = events.filter((e) => isPastEvent(e.date));
        if (expired.length === 0) return;

        await Promise.all(expired.map((e) => dbPromoteToMemory(e.id)));

        set((state) => {
          const remaining = state.events.filter((e) => !isPastEvent(e.date));
          const newMemories = [...expired, ...state.memories]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, MAX_MEMORIES);
          return { events: remaining, memories: newMemories };
        });
      },

      syncFromSupabase: (remoteEvents) => {
        const active = remoteEvents.filter((e) => !isPastEvent(e.date));
        const past = remoteEvents.filter((e) => isPastEvent(e.date));
        set({
          events: active.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
          memories: past
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, MAX_MEMORIES),
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'events-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
