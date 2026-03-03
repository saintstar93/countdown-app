import * as Notifications from 'expo-notifications';
import type { Event } from '~/types/event';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleEventReminder(event: Event): Promise<string | null> {
  try {
    const targetDate = new Date(event.date);
    const reminderDate = new Date(targetDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before

    if (reminderDate <= new Date()) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Domani è il grande giorno!',
        body: `"${event.title}" è domani. Sei pronto?`,
      },
      trigger: { date: reminderDate, type: Notifications.SchedulableTriggerInputTypes.DATE },
    });

    return id;
  } catch {
    return null;
  }
}

export async function cancelEventReminder(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Ignore errors when cancelling
  }
}
