import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Event } from '~/types/event';
import { MAX_EVENTS, MAX_MEMORIES } from '~/constants/config';
import { isPastEvent } from '~/utils/countdown';

interface EventsStore {
  events: Event[];
  memories: Event[];
  isLoading: boolean;
  error: string | null;
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => string | null;
  removeEvent: (id: string) => void;
  updateEvent: (id: string, updates: Partial<Omit<Event, 'id' | 'createdAt' | 'userId'>>) => void;
  syncFromSupabase: (events: Event[]) => void;
  promoteToMemory: (event: Event) => void;
  clearError: () => void;
}

export const useEventsStore = create<EventsStore>()(
  persist(
    (set, get) => ({
      events: [],
      memories: [],
      isLoading: false,
      error: null,

      addEvent: (eventData) => {
        const { events } = get();
        if (events.length >= MAX_EVENTS) {
          return `Puoi avere massimo ${MAX_EVENTS} eventi attivi`;
        }
        const now = new Date().toISOString();
        const newEvent: Event = {
          ...eventData,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          events: [...state.events, newEvent].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          ),
        }));
        return null;
      },

      removeEvent: (id) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        }));
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events
            .map((e) =>
              e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
            )
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        }));
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

      promoteToMemory: (event) => {
        set((state) => {
          const memories = [event, ...state.memories]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, MAX_MEMORIES);
          const events = state.events.filter((e) => e.id !== event.id);
          return { events, memories };
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'events-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
