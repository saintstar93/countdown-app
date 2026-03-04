import { View, Text, Pressable, useColorScheme } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PolaroidSwiper from '~/components/PolaroidSwiper';
import type { Event } from '~/types/event';

// Mock events — sostituire con useEventsStore dopo integrazione Supabase
const Y = new Date().getFullYear();
const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Concerto di Vasco',
    date: new Date(Y, 4, 10).toISOString(),
    location: 'Milano',
    imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600',
    imageObjectFit: 'cover',
    tags: [],
    userId: 'mock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Matrimonio Luca & Sara',
    date: new Date(Y, 5, 21).toISOString(),
    location: 'Firenze',
    imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600',
    imageObjectFit: 'cover',
    tags: [],
    userId: 'mock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Weekend a Parigi',
    date: new Date(Y, 6, 15).toISOString(),
    location: 'Parigi',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
    imageObjectFit: 'cover',
    tags: [],
    userId: 'mock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Compleanno 30 anni',
    date: new Date(Y, 8, 23).toISOString(),
    location: 'Roma',
    imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600',
    imageObjectFit: 'cover',
    tags: [],
    userId: 'mock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Capodanno',
    date: new Date(Y + 1, 0, 1).toISOString(),
    location: 'New York',
    imageUrl: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=600',
    imageObjectFit: 'cover',
    tags: [],
    userId: 'mock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const displayEvents = [...MOCK_EVENTS].sort(
  (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
);

export default function HomeScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(false);

  const iconColor = isDark ? '#FFFFFF' : '#374151';
  const heartColor = liked
    ? (isDark ? '#EF4444' : '#3B82F6')
    : iconColor;

  return (
    <SafeAreaView className="flex-1 bg-[#F0EEF5] dark:bg-[#0D0D0D]" edges={['top']}>

      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-1">
        {/* Spacer left (equals gear icon width) */}
        <View style={{ width: 36 }} />

        <View className="items-center">
          <Text className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Eventi & Ricordi
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/(tabs)/profile')}
          hitSlop={8}
          className="active:opacity-60"
          accessibilityLabel="Impostazioni"
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color={isDark ? '#9CA3AF' : '#6B7280'}
          />
        </Pressable>
      </View>

      {/* ── Subtitle ── */}
      <View className="items-center pb-1">
        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Prossimi eventi
        </Text>
        <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          Scorri per vedere gli eventi futuri.
        </Text>
      </View>

      {/* ── Card Stack ── */}
      <View className="flex-1">
        {displayEvents.length === 0 ? (
          <EmptyState onAdd={() => router.push('/event/create')} />
        ) : (
          <PolaroidSwiper
            events={displayEvents}
            onIndexChange={(i) => { setCurrentIndex(i); setLiked(false); }}
          />
        )}
      </View>

      {/* ── Action bar ── */}
      {displayEvents.length > 0 && (
        <View
          className="flex-row items-center justify-around px-6 py-3 border-t border-gray-200 dark:border-gray-800"
        >
          {/* Mi Piace */}
          <Pressable
            onPress={() => setLiked((v) => !v)}
            className="flex-row items-center gap-1.5 active:opacity-60"
            accessibilityLabel="Mi piace"
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={22}
              color={heartColor}
            />
            <Text style={{ color: heartColor }} className="text-sm font-medium">
              Mi Piace
            </Text>
          </Pressable>

          {/* Commenti */}
          <Pressable
            className="flex-row items-center gap-1.5 active:opacity-60"
            accessibilityLabel="Commenti"
          >
            <Ionicons name="chatbubble-outline" size={21} color={iconColor} />
            <Text style={{ color: iconColor }} className="text-sm font-medium">
              Commenti
            </Text>
          </Pressable>

          {/* Condividi */}
          <Pressable
            className="flex-row items-center gap-1.5 active:opacity-60"
            accessibilityLabel="Condividi"
          >
            <Ionicons name="paper-plane-outline" size={21} color={iconColor} />
            <Text style={{ color: iconColor }} className="text-sm font-medium">
              Condividi
            </Text>
          </Pressable>
        </View>
      )}

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
          Aggiungi il tuo primo evento!
        </Text>
      </View>
      <Pressable
        onPress={onAdd}
        className="bg-gray-900 dark:bg-white px-8 py-4 rounded-full active:opacity-70"
      >
        <Text className="text-white dark:text-gray-900 font-semibold text-base">
          Aggiungi evento
        </Text>
      </Pressable>
    </View>
  );
}
