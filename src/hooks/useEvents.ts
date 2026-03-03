import { useEventsStore } from '~/store/eventsStore';

export function useEvents() {
  const { events, memories, isLoading, error, addEvent, removeEvent, updateEvent, clearError } =
    useEventsStore();
  return { events, memories, isLoading, error, addEvent, removeEvent, updateEvent, clearError };
}
