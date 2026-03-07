import { View, Text, Pressable, Switch, ScrollView, Alert, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '~/store/authStore';
import { useSettingsStore, ACCENT_COLORS } from '~/store/settingsStore';
import { useEventsStore } from '~/store/eventsStore';
import { useAccentColor } from '~/hooks/useAccentColor';
import { useIsDark } from '~/hooks/useTheme';
import type { ThemeMode } from '~/store/settingsStore';
import { dbUpdateTheme, dbDeleteAccountData } from '~/services/database';
import {
  cancelAllNotifications,
  scheduleEventNotifications,
  getNotificationPermissionStatus,
} from '~/services/notifications';
import Constants from 'expo-constants';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

type SectionProps = { title: string; children: React.ReactNode; isDark: boolean };

function Section({ title, children, isDark }: SectionProps) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: '#9B9B9B', marginBottom: 10, paddingHorizontal: 4 }}>
        {title}
      </Text>
      <View style={{
        backgroundColor: isDark ? '#242424' : '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.2 : 0.06,
        shadowRadius: 20,
        elevation: 4,
      }}>
        {children}
      </View>
    </View>
  );
}

type RowProps = {
  icon: string;
  label: string;
  iconColor?: string;
  isDark: boolean;
  right?: React.ReactNode;
  onPress?: () => void;
  isLast?: boolean;
  danger?: boolean;
};

function Row({ icon, label, iconColor, isDark, right, onPress, isLast, danger }: RowProps) {
  const textColor = danger ? '#EF4444' : (isDark ? '#F5F5F5' : '#2D2D2D');
  const divColor = isDark ? '#333333' : '#F0F0F0';
  const iconBg = isDark ? '#333333' : '#F0F0F0';

  const rightEl = right !== undefined
    ? right
    : onPress
      ? <Ionicons name="chevron-forward" size={15} color={isDark ? '#555555' : '#CCCCCC'} />
      : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed && onPress ? 0.6 : 1,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: divColor,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 15, gap: 14 }}>
        <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: iconBg, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon as never} size={17} color={iconColor ?? (isDark ? '#AAAAAA' : '#6B7280')} />
        </View>
        <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: textColor }}>{label}</Text>
        {rightEl}
      </View>
    </Pressable>
  );
}

function ThemeSelector({ isDark, userId, accent }: { isDark: boolean; userId?: string; accent: string }) {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);

  async function handleThemeChange(mode: ThemeMode) {
    setThemeMode(mode);
    if (userId) await dbUpdateTheme(userId, mode);
  }

  const options: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: 'Chiaro', icon: 'sunny-outline' },
    { value: 'system', label: 'Sistema', icon: 'phone-portrait-outline' },
    { value: 'dark', label: 'Scuro', icon: 'moon-outline' },
  ];

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: isDark ? '#242424' : '#FFFFFF',
      borderRadius: 20,
      padding: 6,
      gap: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.2 : 0.06,
      shadowRadius: 20,
      elevation: 4,
    }}>
      {options.map((opt) => {
        const active = themeMode === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => handleThemeChange(opt.value)}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: 'center',
              paddingVertical: 10,
              borderRadius: 14,
              gap: 4,
              backgroundColor: active ? (isDark ? '#333333' : accent + '18') : 'transparent',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name={opt.icon as never} size={18} color={active ? accent : '#9B9B9B'} />
            <Text style={{ fontSize: 11, fontWeight: active ? '700' : '500', color: active ? accent : '#9B9B9B' }}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function AccentPicker({ isDark, accent }: { isDark: boolean; accent: string }) {
  const setAccentColor = useSettingsStore((s) => s.setAccentColor);

  return (
    <View style={{ marginBottom: 28 }}>
      <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: '#9B9B9B', marginBottom: 10, paddingHorizontal: 4 }}>
        Colore tema
      </Text>
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        {ACCENT_COLORS.map((color) => {
          const active = accent === color.value;
          return (
            <Pressable
              key={color.key}
              onPress={() => setAccentColor(color.value)}
              style={({ pressed }) => ({
                alignItems: 'center',
                gap: 6,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: color.value,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: active ? 3 : 0,
                borderColor: isDark ? '#FFFFFF' : '#2D2D2D',
              }}>
                {active && <Ionicons name="checkmark" size={20} color="#FFFFFF" />}
              </View>
              <Text style={{ fontSize: 10, fontWeight: active ? '700' : '500', color: active ? (isDark ? '#F5F5F5' : '#2D2D2D') : '#9B9B9B' }}>
                {color.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const isDark = useIsDark();
  const { user, signOut } = useAuthStore();
  const { notificationsEnabled, setNotificationsEnabled } = useSettingsStore();
  const events = useEventsStore((s) => s.events);
  const notificationIds = useEventsStore((s) => s.notificationIds);
  const accent = useAccentColor();

  async function handleNotificationsToggle(enabled: boolean) {
    if (enabled) {
      const status = await getNotificationPermissionStatus();
      if (status === 'denied') {
        Alert.alert(
          'Notifiche disabilitate',
          'Le notifiche sono state disabilitate nelle impostazioni del telefono. Per attivarle, vai in Impostazioni → Notifiche → Countdown App e abilita le notifiche.',
          [
            { text: 'Annulla', style: 'cancel' },
            { text: 'Apri Impostazioni', onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
      setNotificationsEnabled(true);
      await Promise.all(
        events.map((event) => {
          const existing = notificationIds[event.id];
          if (!existing?.length) return scheduleEventNotifications(event);
          return Promise.resolve([]);
        }),
      );
    } else {
      setNotificationsEnabled(false);
      await cancelAllNotifications();
    }
  }

  const bg = isDark ? '#1A1A1A' : '#F5F5F0';
  const textColor = isDark ? '#F5F5F5' : '#2D2D2D';
  const cardBg = isDark ? '#242424' : '#FFFFFF';

  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'Utente';
  const email = user?.email ?? '';

  async function handleLogout() {
    Alert.alert('Logout', 'Sei sicuro di voler uscire?', [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Esci', style: 'destructive', onPress: async () => { await signOut(); } },
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Elimina account',
      'Questa azione è irreversibile. Tutti i tuoi eventi, ricordi e dati personali verranno eliminati definitivamente.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina definitivamente',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Sei sicuro?',
              'Confermando, tutti i tuoi dati verranno cancellati e non potranno essere recuperati.',
              [
                { text: 'Annulla', style: 'cancel' },
                {
                  text: 'Sì, elimina tutto',
                  style: 'destructive',
                  onPress: async () => {
                    if (!user) return;
                    const { error } = await dbDeleteAccountData(user.id);
                    if (error) {
                      Alert.alert('Errore', 'Impossibile eliminare i dati. Riprova o contatta danielepiani1993@gmail.com');
                      return;
                    }
                    await signOut();
                  },
                },
              ],
            );
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22, paddingBottom: 48 }}>

        {/* Header */}
        <Text style={{ fontSize: 28, fontWeight: '800', color: textColor, letterSpacing: -0.5, marginBottom: 24 }}>
          Profilo
        </Text>

        {/* User card */}
        <View style={{
          backgroundColor: cardBg,
          borderRadius: 24,
          padding: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          marginBottom: 28,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.2 : 0.06,
          shadowRadius: 20,
          elevation: 4,
        }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: accent, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#FFFFFF' }}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: textColor }}>{displayName}</Text>
            {email ? <Text style={{ fontSize: 13, color: '#9B9B9B', marginTop: 2 }}>{email}</Text> : null}
          </View>
        </View>

        {/* Appearance */}
        <View style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: '#9B9B9B', marginBottom: 10, paddingHorizontal: 4 }}>
            Aspetto
          </Text>
          <ThemeSelector isDark={isDark} userId={user?.id} accent={accent} />
        </View>

        {/* Accent color picker */}
        <AccentPicker isDark={isDark} accent={accent} />

        {/* Notifications — mobile only */}
        {Platform.OS !== 'web' && (
          <Section title="Notifiche" isDark={isDark}>
            <Row
              icon="notifications-outline"
              label="Notifiche eventi"
              isDark={isDark}
              isLast
              right={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationsToggle}
                  trackColor={{ false: isDark ? '#3A3A3A' : '#E5E7EB', true: accent }}
                  thumbColor="#FFFFFF"
                />
              }
            />
          </Section>
        )}

        {/* Support */}
        <Section title="Supporto" isDark={isDark}>
          <Row
            icon="bulb-outline"
            label="Suggerimenti"
            isDark={isDark}
            onPress={() => router.push('/suggestions')}
          />
          <Row
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            isDark={isDark}
            onPress={() => Linking.openURL('https://saintstar93.github.io/countdown-app/privacy.html').catch(() => Alert.alert('Errore', 'Impossibile aprire il link.'))}
          />
          <Row
            icon="document-text-outline"
            label="Termini di Servizio"
            isDark={isDark}
            onPress={() => Linking.openURL('https://saintstar93.github.io/countdown-app/terms.html').catch(() => Alert.alert('Errore', 'Impossibile aprire il link.'))}
          />
          <Row
            icon="information-circle-outline"
            label={`Versione ${APP_VERSION}`}
            isDark={isDark}
            isLast
          />
        </Section>

        {/* Account */}
        <Section title="Account" isDark={isDark}>
          <Row
            icon="log-out-outline"
            label="Logout"
            isDark={isDark}
            iconColor="#EF4444"
            danger
            onPress={handleLogout}
          />
          <Row
            icon="trash-outline"
            label="Elimina account"
            isDark={isDark}
            iconColor="#EF4444"
            danger
            onPress={handleDeleteAccount}
            isLast
          />
        </Section>

        <Text style={{ fontSize: 12, color: '#9B9B9B', textAlign: 'center', lineHeight: 18 }}>
          Fatto con ♥ · Immagini da Unsplash
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}
