import { View, Text, Pressable, useColorScheme } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PolaroidSwiper from '~/components/PolaroidSwiper';
import { useEventsStore } from '~/store/eventsStore';
import type { Event } from '~/types/event';

export default function HomeScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const events = useEventsStore((s) => s.events);
  const checkAndPromoteExpiredEvents = useEventsStore((s) => s.checkAndPromoteExpiredEvents);
  const iconColor = isDark ? '#FFFFFF' : '#111827';
  const mutedColor = isDark ? '#6B7280' : '#9CA3AF';

  useFocusEffect(
    useCallback(() => {
      checkAndPromoteExpiredEvents();
    }, [checkAndPromoteExpiredEvents])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0D0D0D' : '#F5F5F5' }} edges={['top']}>

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
        <Pressable
          onPress={() => router.push('/(tabs)/profile')}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          accessibilityLabel="Impostazioni"
        >
          <Ionicons name="person-circle-outline" size={26} color={mutedColor} />
        </Pressable>

        <Text style={{ fontSize: 17, fontWeight: '700', color: isDark ? '#FFFFFF' : '#111827', letterSpacing: -0.3 }}>
          Countdown
        </Text>

        <Pressable
          onPress={() => router.push('/event/create')}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          accessibilityLabel="Aggiungi evento"
        >
          <Ionicons name="add-circle-outline" size={26} color={iconColor} />
        </Pressable>
      </View>

      {/* Card Stack */}
      <View style={{ flex: 1 }}>
        {events.length === 0 ? (
          <EmptyState isDark={isDark} onAdd={() => router.push('/event/create')} />
        ) : (
          <PolaroidSwiper events={events} onEventPress={(e: Event) => router.push(`/event/${e.id}`)} />
        )}
      </View>

    </SafeAreaView>
  );
}

function EmptyState({ isDark, onAdd }: { isDark: boolean; onAdd: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 24 }}>
      <Text style={{ fontSize: 56 }}>📸</Text>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: isDark ? '#FFFFFF' : '#111827', textAlign: 'center', letterSpacing: -0.5 }}>
          Nessun evento
        </Text>
        <Text style={{ fontSize: 15, color: isDark ? '#6B7280' : '#9CA3AF', textAlign: 'center', lineHeight: 22 }}>
          Aggiungi il tuo primo evento
        </Text>
      </View>
      <Pressable
        onPress={onAdd}
        style={({ pressed }) => ({
          backgroundColor: isDark ? '#FFFFFF' : '#111827',
          paddingHorizontal: 32,
          paddingVertical: 15,
          borderRadius: 100,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ color: isDark ? '#111827' : '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
          Aggiungi evento
        </Text>
      </Pressable>
    </View>
  );
}
