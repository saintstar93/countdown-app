import { Platform } from 'react-native';
import type { Event } from '~/types/event';
import type { ApiResponse } from '~/types/api';
import { formatCountdown, getCountdownValue } from '~/utils/countdown';

// ─── Shared ICS builder ───────────────────────────────────────────────────────

function toICSDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function escapeICS(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function buildICS(event: Event): string {
  const eventDate = new Date(event.date);
  const dateStr = toICSDate(eventDate);
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const countdownValue = getCountdownValue(event.date);
  const countdown = formatCountdown(countdownValue, event.countdownFormat ?? 'days');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Countdown App//IT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@countdown-app`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${dateStr}`,
    `DTEND;VALUE=DATE:${dateStr}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(`Countdown: ${countdown}`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

// ─── Web: download .ics via browser ──────────────────────────────────────────

function downloadICSWeb(event: Event): ApiResponse<null> {
  try {
    const ics = buildICS(event);
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    return { data: null, error: null };
  } catch {
    return { data: null, error: 'Download non riuscito' };
  }
}

// ─── iOS: add directly via expo-calendar ─────────────────────────────────────

async function addToCalendarIOS(event: Event): Promise<ApiResponse<null>> {
  const CalendarAPI = await import('expo-calendar');
  const { status } = await CalendarAPI.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    return { data: null, error: 'Permesso calendario negato' };
  }

  const calendars = await CalendarAPI.getCalendarsAsync(CalendarAPI.EntityTypes.EVENT);
  const writable = calendars.find((c) => c.allowsModifications) ?? calendars[0];
  if (!writable) {
    return { data: null, error: 'Nessun calendario disponibile' };
  }

  const countdownValue = getCountdownValue(event.date);
  const countdown = formatCountdown(countdownValue, event.countdownFormat ?? 'days');
  const eventDate = new Date(event.date);

  await CalendarAPI.createEventAsync(writable.id, {
    title: event.title,
    startDate: eventDate,
    endDate: eventDate,
    allDay: true,
    notes: `Countdown: ${countdown}`,
    location: event.location,
  });

  return { data: null, error: null };
}

// ─── Android: share .ics file ─────────────────────────────────────────────────

async function shareICSAndroid(event: Event): Promise<ApiResponse<null>> {
  const Sharing = await import('expo-sharing');
  const FileSystem = await import('expo-file-system/legacy');

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    return { data: null, error: 'Condivisione non disponibile su questo dispositivo' };
  }

  const fileName = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, buildICS(event), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/calendar',
    dialogTitle: 'Aggiungi al calendario',
  });

  return { data: null, error: null };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function exportEventToCalendar(event: Event): Promise<ApiResponse<null>> {
  try {
    if (Platform.OS === 'web') {
      return downloadICSWeb(event);
    }
    if (Platform.OS === 'ios') {
      return await addToCalendarIOS(event);
    }
    return await shareICSAndroid(event);
  } catch {
    return { data: null, error: "Errore durante l'esportazione al calendario" };
  }
}
