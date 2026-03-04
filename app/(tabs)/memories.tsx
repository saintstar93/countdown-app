import { View, Text, FlatList, Pressable, Image, useColorScheme, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useEventsStore } from '~/store/eventsStore';
import { formatShortDate } from '~/utils/date';
import type { Event } from '~/types/event';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = (SCREEN_W - 16 * 2 - 12) / 2;
const IMAGE_H = CARD_W * 0.9;

function MemoryCard({ event, index, onPress }: { event: Event; index: number; onPress: () => void }) {
  const isDark = useColorScheme() === 'dark';
  const cardBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const mutedColor = isDark ? '#6B7280' : '#9CA3AF';

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
          width: CARD_W,
          backgroundColor: cardBg,
          borderRadius: 14,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 6,
          elevation: 3,
        })}
      >
        {/* Image */}
        <View style={{ width: CARD_W, height: IMAGE_H, backgroundColor: isDark ? '#2A2A2A' : '#E5E7EB' }}>
          {event.imageUrl ? (
            <Image
              source={{ uri: event.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode={event.imageObjectFit === 'contain' ? 'contain' : 'cover'}
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="calendar-outline" size={32} color={mutedColor} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={{ padding: 10, gap: 3 }}>
          <Text
            style={{ fontSize: 13, fontWeight: '700', color: textColor, fontFamily: event.font ?? undefined }}
            numberOfLines={2}
          >
            {event.title}
          </Text>
          <Text style={{ fontSize: 11, color: mutedColor, fontWeight: '500' }}>
            {formatShortDate(event.date)}
          </Text>

          {/* Tags */}
          {event.tags.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
              {event.tags.slice(0, 2).map((tag) => (
                <View
                  key={tag.id}
                  style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, backgroundColor: tag.color + '25' }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '600', color: tag.color }}>{tag.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function MemoriesScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const memories = useEventsStore((s) => s.memories);

  const bg = isDark ? '#0D0D0D' : '#F0EEF5';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const mutedColor = isDark ? '#6B7280' : '#9CA3AF';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: textColor, letterSpacing: -0.5 }}>
          Ricordi
        </Text>
        <Text style={{ fontSize: 13, color: mutedColor, marginTop: 2 }}>
          {memories.length > 0
            ? `${memories.length} ricord${memories.length === 1 ? 'o' : 'i'}`
            : 'Gli eventi passati appariranno qui'}
        </Text>
      </View>

      {memories.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 16 }}>
          <Text style={{ fontSize: 56 }}>🎞️</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: textColor, textAlign: 'center' }}>
            Nessun ricordo ancora
          </Text>
          <Text style={{ fontSize: 14, color: mutedColor, textAlign: 'center', lineHeight: 20 }}>
            I tuoi eventi passati appariranno qui come ricordi da rivivere
          </Text>
        </View>
      ) : (
        <FlatList
          data={memories}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          columnWrapperStyle={{ gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <MemoryCard
              event={item}
              index={index}
              onPress={() => router.push(`/event/${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
