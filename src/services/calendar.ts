import * as Calendar from 'expo-calendar';
import type { Event } from '~/types/event';
import type { ApiResponse } from '~/types/api';

export async function requestCalendarPermissions(): Promise<boolean> {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function addEventToCalendar(event: Event): Promise<ApiResponse<string>> {
  try {
    const granted = await requestCalendarPermissions();
    if (!granted) {
      return { data: null, error: 'Permesso calendario negato' };
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCalendar = calendars.find((c) => c.allowsModifications) ?? calendars[0];

    if (!defaultCalendar) {
      return { data: null, error: 'Nessun calendario disponibile' };
    }

    const eventDate = new Date(event.date);
    const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000); // +1 hour

    const calendarEventId = await Calendar.createEventAsync(defaultCalendar.id, {
      title: event.title,
      startDate: eventDate,
      endDate,
      allDay: true,
      notes: `Evento Countdown App: ${event.title}`,
    });

    return { data: calendarEventId, error: null };
  } catch (err) {
    return { data: null, error: 'Errore durante il salvataggio nel calendario' };
  }
}
