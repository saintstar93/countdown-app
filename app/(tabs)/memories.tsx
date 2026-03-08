import { View, Text, FlatList, Pressable, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useEventsStore } from '~/store/eventsStore';
import Logo from '~/components/ui/Logo';
import { formatShortDate } from '~/utils/date';
import { useIsDark } from '~/hooks/useTheme';
import type { Event } from '~/types/event';

const { width: SCREEN_W } = Dimensions.get('window');
const GAP = 12;
const H_PAD = 20;
const CARD_W = (SCREEN_W - H_PAD * 2 - GAP) / 2;
const IMAGE_H = CARD_W * 0.88;

function MemoryCard({ event, index, onPress }: { event: Event; index: number; onPress: () => void }) {
  const isDark = useIsDark();
  const cardBg = isDark ? '#242424' : '#FFFFFF';
  const textColor = isDark ? '#F5F5F5' : '#2D2D2D';

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1.0 }],
          width: CARD_W,
          backgroundColor: cardBg,
          borderRadius: 20,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.2 : 0.06,
          shadowRadius: 20,
          elevation: 4,
        })}
      >
        {/* Image */}
        <View style={{ width: CARD_W, height: IMAGE_H, backgroundColor: isDark ? '#333333' : '#EEEEEE' }}>
          {event.imageUrl ? (
            <Image
              source={{ uri: event.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode={event.imageObjectFit === 'contain' ? 'contain' : 'cover'}
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="heart-outline" size={28} color="#9B9B9B" />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={{ padding: 12, gap: 3 }}>
          <Text
            style={{ fontSize: 13, fontWeight: '700', color: textColor, fontFamily: event.font ?? undefined }}
            numberOfLines={2}
          >
            {event.title}
          </Text>
          <Text style={{ fontSize: 11, color: '#9B9B9B', fontWeight: '500' }}>
            {formatShortDate(event.date)}
          </Text>

          {/* Tags */}
          {event.tags.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 3 }}>
              {event.tags.slice(0, 2).map((tag) => (
                <View
                  key={tag.id}
                  style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 50, backgroundColor: tag.color + '22' }}
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
  const isDark = useIsDark();
  const memories = useEventsStore((s) => s.memories);

  const bg = isDark ? '#1A1A1A' : '#F5F5F0';
  const textColor = isDark ? '#F5F5F5' : '#2D2D2D';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 22, paddingTop: 10, paddingBottom: 6 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: textColor, letterSpacing: -0.5 }}>
          Ricordi
        </Text>
        <Text style={{ fontSize: 13, color: '#9B9B9B', marginTop: 2 }}>
          {memories.length > 0
            ? `${memories.length} ricord${memories.length === 1 ? 'o' : 'i'}`
            : 'Gli eventi passati appariranno qui'}
        </Text>
      </View>

      {memories.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 16 }}>
          <Logo size="large" showText={false} opacity={0.35} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: textColor, textAlign: 'center' }}>
            Nessun ricordo ancora
          </Text>
          <Text style={{ fontSize: 14, color: '#9B9B9B', textAlign: 'center', lineHeight: 20 }}>
            I tuoi eventi passati appariranno qui come ricordi da rivivere
          </Text>
        </View>
      ) : (
        <FlatList
          data={memories}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: H_PAD, gap: GAP }}
          columnWrapperStyle={{ gap: GAP }}
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
