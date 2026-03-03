import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import PolaroidSwiper from '~/components/PolaroidSwiper';
import { DEFAULT_COUNTDOWN_FORMAT } from '~/constants/countdown';
import type { Event } from '~/types/event';

// Mock events — sostituire con useEventsStore dopo integrazione Supabase
const Y = new Date().getFullYear();
const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Concerto',
    date: new Date(Y, 4, 10).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600',
    imageObjectFit: 'cover',
    tags: [],
    userId: 'mock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Vacanze estive',
    date: new Date(Y, 6, 15).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
    imageObjectFit: 'cover',
    tags: [],
    userId: 'mock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Compleanno',
    date: new Date(Y, 8, 23).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600',
    imageObjectFit: 'cover',
    tags: [],
    userId: 'mock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Capodanno',
    date: new Date(Y + 1, 0, 1).toISOString(),
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

  return (
    <SafeAreaView className="flex-1 bg-[#F5F0E8] dark:bg-[#111111]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Countdown</Text>
        <Pressable
          onPress={() => router.push('/event/create')}
          className="w-10 h-10 rounded-full bg-gray-900 dark:bg-white items-center justify-center active:opacity-70"
          accessibilityLabel="Crea nuovo evento"
        >
          <Text className="text-white dark:text-gray-900 text-2xl leading-none" style={{ marginTop: -2 }}>
            +
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <View className="flex-1">
        {displayEvents.length === 0 ? (
          <EmptyState onAdd={() => router.push('/event/create')} />
        ) : (
          <PolaroidSwiper events={displayEvents} format={DEFAULT_COUNTDOWN_FORMAT} />
        )}
      </View>
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
