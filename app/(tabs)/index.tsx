import { View, Text, Pressable, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PolaroidSwiper from '~/components/PolaroidSwiper';
import Logo from '~/components/ui/Logo';
import { useEventsStore } from '~/store/eventsStore';
import { useAuthStore } from '~/store/authStore';
import { useAccentColor } from '~/hooks/useAccentColor';
import { useIsDark } from '~/hooks/useTheme';
import { useTranslation } from '~/i18n';
import type { Event } from '~/types/event';

export default function HomeScreen() {
  const t = useTranslation();
  const router = useRouter();
  const isDark = useIsDark();
  const events = useEventsStore((s) => s.events);
  const eventsError = useEventsStore((s) => s.error);
  const checkAndPromoteExpiredEvents = useEventsStore((s) => s.checkAndPromoteExpiredEvents);
  const user = useAuthStore((s) => s.user);
  const accent = useAccentColor();

  const bg = isDark ? '#1A1A1A' : '#F5F5F0';
  const textColor = isDark ? '#F5F5F5' : '#2D2D2D';
  const mutedColor = '#9B9B9B';
  const iconBg = isDark ? '#333333' : '#EEEEEE';

  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? '';

  useFocusEffect(
    useCallback(() => {
      checkAndPromoteExpiredEvents();
    }, [checkAndPromoteExpiredEvents])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top']}>

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 10, paddingBottom: 6 }}>

        {/* Greeting split typography */}
        <View>
          <Text style={{ fontSize: 26, fontWeight: '800', color: textColor, letterSpacing: -0.5, lineHeight: 30 }}>
            {t.home.greeting}
          </Text>
          {displayName ? (
            <Text style={{ fontSize: 14, fontWeight: '300', color: mutedColor, letterSpacing: 0.1 }}>
              {displayName}
            </Text>
          ) : null}
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {Platform.OS !== 'web' && (
            <Pressable
              onPress={() => router.push('/calendar-sync')}
              hitSlop={8}
              style={({ pressed }) => ({
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: iconBg,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.6 : 1,
              })}
              accessibilityLabel={t.home.accessibilityCalendarSync}
            >
              <Ionicons name="calendar-outline" size={20} color={mutedColor} />
            </Pressable>
          )}
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            hitSlop={8}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: iconBg,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.6 : 1,
            })}
            accessibilityLabel={t.home.accessibilityProfile}
          >
            <Ionicons name="person-outline" size={20} color={mutedColor} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/event/create')}
            hitSlop={8}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: accent,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
            accessibilityLabel={t.home.accessibilityAddEvent}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {/* Network/Supabase error banner */}
      {eventsError ? (
        <View style={{ marginHorizontal: 16, marginBottom: 8, backgroundColor: isDark ? '#2D1515' : '#FEE2E2', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 }}>
          <Text style={{ fontSize: 13, color: '#DC2626', textAlign: 'center' }}>
            {eventsError}
          </Text>
        </View>
      ) : null}

      {/* Card Stack */}
      <View style={{ flex: 1 }}>
        {events.length === 0 ? (
          <EmptyState isDark={isDark} accent={accent} onAdd={() => router.push('/event/create')} />
        ) : (
          <PolaroidSwiper events={events} onEventPress={(e: Event) => router.push(`/event/${e.id}`)} />
        )}
      </View>

    </SafeAreaView>
  );
}

function EmptyState({ isDark, accent, onAdd }: { isDark: boolean; accent: string; onAdd: () => void }) {
  const t = useTranslation();
  const textColor = isDark ? '#F5F5F5' : '#2D2D2D';
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 24 }}>
      <Logo size="large" showText={false} opacity={0.35} />
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: textColor, textAlign: 'center', letterSpacing: -0.5 }}>
          {t.home.emptyTitle}
        </Text>
        <Text style={{ fontSize: 15, color: '#9B9B9B', textAlign: 'center', lineHeight: 22 }}>
          {t.home.emptySubtitle}
        </Text>
      </View>
      <Pressable
        onPress={onAdd}
        style={({ pressed }) => ({
          backgroundColor: accent,
          paddingHorizontal: 32,
          paddingVertical: 15,
          borderRadius: 50,
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
          {t.home.emptyButton}
        </Text>
      </Pressable>
    </View>
  );
}
