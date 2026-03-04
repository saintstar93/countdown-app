import { View, Text, Pressable, useColorScheme } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PolaroidSwiper from '~/components/PolaroidSwiper';
import EventFullScreen from '~/components/EventFullScreen';
import { useEventsStore } from '~/store/eventsStore';
import type { Event } from '~/types/event';

export default function HomeScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const events = useEventsStore((s) => s.events);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-[#F0EEF5] dark:bg-[#0D0D0D]" edges={['top']}>

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-1">
        <Pressable
          onPress={() => router.push('/(tabs)/profile')}
          hitSlop={8}
          className="active:opacity-60"
          accessibilityLabel="Impostazioni"
        >
          <Ionicons name="settings-outline" size={22} color={isDark ? '#9CA3AF' : '#6B7280'} />
        </Pressable>

        <Text className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          Countdown
        </Text>

        <Pressable
          onPress={() => router.push('/event/create')}
          hitSlop={8}
          className="active:opacity-60"
          accessibilityLabel="Aggiungi evento"
        >
          <Ionicons name="add" size={28} color={isDark ? '#A78BFA' : '#6366F1'} />
        </Pressable>
      </View>

      {/* Subtitle */}
      <View className="items-center pb-1">
        <Text className="text-xs text-gray-400 dark:text-gray-500">
          {events.length > 0
            ? `${events.length} event${events.length === 1 ? 'o' : 'i'}`
            : 'Nessun evento · premi + per aggiungere'}
        </Text>
      </View>

      {/* Card Stack */}
      <View className="flex-1">
        {events.length === 0 ? (
          <EmptyState onAdd={() => router.push('/event/create')} />
        ) : (
          <PolaroidSwiper events={events} onEventPress={setSelectedEvent} />
        )}
      </View>

      {/* Full-screen detail modal */}
      <EventFullScreen event={selectedEvent} onClose={() => setSelectedEvent(null)} />

    </SafeAreaView>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8 gap-6">
      <Text style={{ fontSize: 64 }}>📸</Text>
      <View className="items-center gap-2">
        <Text className="text-xl font-bold text-gray-900 dark:text-white text-center">
          Nessun evento
        </Text>
        <Text className="text-base text-gray-500 dark:text-gray-400 text-center">
          Aggiungi il tuo primo evento con il tasto +
        </Text>
      </View>
      <Pressable
        onPress={onAdd}
        className="bg-indigo-500 px-8 py-4 rounded-full active:opacity-70"
      >
        <Text className="text-white font-semibold text-base">Aggiungi evento</Text>
      </Pressable>
    </View>
  );
}
