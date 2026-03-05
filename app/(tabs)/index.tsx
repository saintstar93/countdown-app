import { View, Text, Pressable, useColorScheme } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PolaroidSwiper from '~/components/PolaroidSwiper';
import { useEventsStore } from '~/store/eventsStore';
import { useAuthStore } from '~/store/authStore';
import type { Event } from '~/types/event';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buongiorno';
  if (hour < 18) return 'Buon pomeriggio';
  return 'Buonasera';
}

export default function HomeScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const events = useEventsStore((s) => s.events);
  const checkAndPromoteExpiredEvents = useEventsStore((s) => s.checkAndPromoteExpiredEvents);
  const user = useAuthStore((s) => s.user);

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
            {getGreeting()}
          </Text>
          {displayName ? (
            <Text style={{ fontSize: 14, fontWeight: '300', color: mutedColor, letterSpacing: 0.1 }}>
              {displayName}
            </Text>
          ) : null}
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
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
            accessibilityLabel="Profilo"
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
              backgroundColor: '#E8754A',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
            accessibilityLabel="Aggiungi evento"
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
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
  const textColor = isDark ? '#F5F5F5' : '#2D2D2D';
  const mutedColor = '#9B9B9B';
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 24 }}>
      <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: isDark ? '#333333' : '#EEEEEE', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 38 }}>📸</Text>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: textColor, textAlign: 'center', letterSpacing: -0.5 }}>
          Nessun evento
        </Text>
        <Text style={{ fontSize: 15, color: mutedColor, textAlign: 'center', lineHeight: 22 }}>
          Aggiungi il tuo primo evento e inizia il countdown
        </Text>
      </View>
      <Pressable
        onPress={onAdd}
        style={({ pressed }) => ({
          backgroundColor: '#E8754A',
          paddingHorizontal: 32,
          paddingVertical: 15,
          borderRadius: 50,
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
          Aggiungi evento
        </Text>
      </Pressable>
    </View>
  );
}
