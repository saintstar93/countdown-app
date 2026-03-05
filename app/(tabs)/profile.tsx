import { View, Text, Pressable, Switch, ScrollView, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '~/store/authStore';
import { useSettingsStore } from '~/store/settingsStore';
import type { ThemeMode } from '~/store/settingsStore';
import { dbUpdateTheme } from '~/services/database';
import Constants from 'expo-constants';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

type SectionProps = { title: string; children: React.ReactNode; isDark: boolean };

function Section({ title, children, isDark }: SectionProps) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: isDark ? '#6B7280' : '#9CA3AF', marginBottom: 8, paddingHorizontal: 4 }}>
        {title}
      </Text>
      <View style={{ backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF', borderRadius: 16, overflow: 'hidden' }}>
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
  const textColor = danger ? '#EF4444' : (isDark ? '#FFFFFF' : '#111827');
  const divColor = isDark ? '#2A2A2A' : '#F3F4F6';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        opacity: pressed && onPress ? 0.6 : 1,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: divColor,
      })}
    >
      <Ionicons name={icon as never} size={20} color={iconColor ?? (isDark ? '#9CA3AF' : '#6B7280')} />
      <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: textColor }}>{label}</Text>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={16} color={isDark ? '#4B5563' : '#D1D5DB'} /> : null)}
    </Pressable>
  );
}

function ThemeSelector({ isDark, userId }: { isDark: boolean; userId?: string }) {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);

  async function handleThemeChange(mode: ThemeMode) {
    setThemeMode(mode);
    if (userId) {
      await dbUpdateTheme(userId, mode);
    }
  }

  const options: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: 'Chiaro', icon: 'sunny-outline' },
    { value: 'system', label: 'Sistema', icon: 'phone-portrait-outline' },
    { value: 'dark', label: 'Scuro', icon: 'moon-outline' },
  ];
  const bg = isDark ? '#1A1A1A' : '#FFFFFF';
  const activeBg = isDark ? '#2D2D2D' : '#F0EEF5';
  return (
    <View style={{ flexDirection: 'row', backgroundColor: bg, borderRadius: 16, padding: 6, gap: 4 }}>
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
              borderRadius: 10,
              gap: 4,
              backgroundColor: active ? activeBg : 'transparent',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons
              name={opt.icon as never}
              size={18}
              color={active ? '#6366F1' : (isDark ? '#6B7280' : '#9CA3AF')}
            />
            <Text style={{ fontSize: 11, fontWeight: active ? '700' : '500', color: active ? '#6366F1' : (isDark ? '#6B7280' : '#9CA3AF') }}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const { user, signOut } = useAuthStore();
  const { notificationsEnabled, setNotificationsEnabled } = useSettingsStore();

  const bg = isDark ? '#0D0D0D' : '#F0EEF5';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const mutedColor = isDark ? '#6B7280' : '#9CA3AF';
  const cardBg = isDark ? '#1A1A1A' : '#FFFFFF';

  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'Utente';
  const email = user?.email ?? '';

  async function handleLogout() {
    Alert.alert('Logout', 'Sei sicuro di voler uscire?', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Esci',
        style: 'destructive',
        onPress: async () => { await signOut(); },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>

        {/* Header */}
        <Text style={{ fontSize: 28, fontWeight: '800', color: textColor, letterSpacing: -0.5, marginBottom: 24 }}>
          Profilo
        </Text>

        {/* User card */}
        <View style={{ backgroundColor: cardBg, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#FFFFFF' }}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: textColor }}>{displayName}</Text>
            {email ? (
              <Text style={{ fontSize: 13, color: mutedColor, marginTop: 2 }}>{email}</Text>
            ) : null}
          </View>
        </View>

        {/* Appearance */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: mutedColor, marginBottom: 8, paddingHorizontal: 4 }}>
            Aspetto
          </Text>
          <ThemeSelector isDark={isDark} userId={user?.id} />
        </View>

        {/* Notifications */}
        <Section title="Notifiche" isDark={isDark}>
          <Row
            icon="notifications-outline"
            label="Notifiche eventi"
            isDark={isDark}
            isLast
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: isDark ? '#3A3A3A' : '#E5E7EB', true: '#6366F1' }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </Section>

        {/* Support */}
        <Section title="Supporto" isDark={isDark}>
          <Row
            icon="bulb-outline"
            label="Suggerimenti"
            isDark={isDark}
            onPress={() => router.push('/suggestions')}
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
            isLast
          />
        </Section>

        {/* Credits */}
        <Text style={{ fontSize: 12, color: mutedColor, textAlign: 'center', lineHeight: 18 }}>
          Fatto con ♥ · Immagini da Unsplash
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}
