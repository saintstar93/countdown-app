import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { Event } from '~/types/event';
import type { ApiResponse } from '~/types/api';
import { formatCountdown, getCountdownValue } from '~/utils/countdown';

function toICSDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function escapeICS(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function buildICS(event: Event): string {
  const eventDate = new Date(event.date);
  const dateStr = toICSDate(eventDate);
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const uid = `${event.id}@countdown-app`;

  const countdownValue = getCountdownValue(event.date);
  const countdown = formatCountdown(countdownValue, event.countdownFormat ?? 'days');
  const description = escapeICS(`Countdown: ${countdown}`);
  const title = escapeICS(event.title);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Countdown App//IT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${dateStr}`,
    `DTEND;VALUE=DATE:${dateStr}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export async function exportEventToCalendar(event: Event): Promise<ApiResponse<null>> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      return { data: null, error: 'Condivisione non disponibile su questo dispositivo' };
    }

    const icsContent = buildICS(event);
    const fileName = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, icsContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/calendar',
      dialogTitle: 'Aggiungi al calendario',
      UTI: 'com.apple.ical.ics',
    });

    return { data: null, error: null };
  } catch {
    return { data: null, error: 'Errore durante l\'esportazione' };
  }
}
