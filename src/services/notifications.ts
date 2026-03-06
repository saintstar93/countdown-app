import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Event } from '~/types/event';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function getNotificationPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  if (Platform.OS === 'web') return 'denied';
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch {
    return 'undetermined';
  }
}

/** Schedule 3 reminders: 7 days before, 1 day before, on the day. Returns list of IDs scheduled. */
export async function scheduleEventNotifications(event: Event): Promise<string[]> {
  if (Platform.OS === 'web') return [];
  const ids: string[] = [];
  const targetDate = new Date(event.date);
  const now = new Date();

  const reminders: { offsetMs: number; title: string; body: string }[] = [
    {
      offsetMs: 7 * 24 * 60 * 60 * 1000,
      title: `Mancano 7 giorni a ${event.title}!`,
      body: `Mancano 7 giorni a "${event.title}". Preparati!`,
    },
    {
      offsetMs: 24 * 60 * 60 * 1000,
      title: `Domani è il giorno: ${event.title}!`,
      body: `Domani è il grande giorno: "${event.title}". Sei pronto?`,
    },
    {
      offsetMs: 0,
      title: `Oggi è il giorno: ${event.title}! 🎉`,
      body: `Oggi è il giorno di "${event.title}"! Goditi ogni momento.`,
    },
  ];

  for (const reminder of reminders) {
    const triggerDate = new Date(targetDate.getTime() - reminder.offsetMs);
    // Set time to 9:00 AM for same-day notification, keep the exact offset otherwise
    if (reminder.offsetMs === 0) {
      triggerDate.setHours(9, 0, 0, 0);
    }
    if (triggerDate <= now) continue;

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.body,
        },
        trigger: {
          date: triggerDate,
          type: Notifications.SchedulableTriggerInputTypes.DATE,
        },
      });
      ids.push(id);
    } catch {
      // Skip reminders that fail to schedule
    }
  }

  return ids;
}

/** Cancel all notifications associated with an event. */
export async function cancelEventNotifications(notificationIds: string[]): Promise<void> {
  if (Platform.OS === 'web') return;
  await Promise.all(
    notificationIds.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => {}),
    ),
  );
}

/** Cancel all scheduled notifications (used when toggling notifications off). */
export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Ignore
  }
}
