import { View, Text, FlatList, Pressable, Image, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useEventsStore } from '~/store/eventsStore';
import Logo from '~/components/ui/Logo';
import { formatShortDate } from '~/utils/date';
import { useIsDark } from '~/hooks/useTheme';
import { useTranslation } from '~/i18n';
import type { Event } from '~/types/event';

const { width: SCREEN_W } = Dimensions.get('window');
const H_PAD = 20;
const CARD_W = SCREEN_W - H_PAD * 2;
const IMAGE_S = 90;

function MemoryCard({ event, index, onPress, onDelete }: { event: Event; index: number; onPress: () => void; onDelete: () => void }) {
  const isDark = useIsDark();
  const cardBg = isDark ? '#242424' : '#FFFFFF';
  const textColor = isDark ? '#F5F5F5' : '#2D2D2D';

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <Pressable
        onPress={onPress}
        onLongPress={onDelete}
        delayLongPress={500}
        style={({ pressed }) => ({
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1.0 }],
          width: CARD_W,
          backgroundColor: cardBg,
          borderRadius: 18,
          flexDirection: 'row',
          alignItems: 'center',
          padding: 14,
          gap: 14,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.2 : 0.06,
          shadowRadius: 12,
          elevation: 3,
        })}
      >
        {/* Square image */}
        <View style={{
          width: IMAGE_S,
          height: IMAGE_S,
          borderRadius: 12,
          backgroundColor: isDark ? '#333333' : '#EEEEEE',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
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
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{ fontSize: 15, fontWeight: '700', color: textColor, fontFamily: event.font ?? undefined }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {event.title}
          </Text>
          <Text style={{ fontSize: 12, color: '#9B9B9B', fontWeight: '500' }}>
            {formatShortDate(event.date)}
          </Text>

          {/* Tags */}
          {event.tags.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
              {event.tags.slice(0, 2).map((tag) => (
                <View
                  key={tag.id}
                  style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50, backgroundColor: tag.color + '22' }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '600', color: tag.color }}>{tag.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={16} color={isDark ? '#444' : '#CCC'} />
      </Pressable>
    </Animated.View>
  );
}

export default function MemoriesScreen() {
  const t = useTranslation();
  const router = useRouter();
  const isDark = useIsDark();
  const memories = useEventsStore((s) => s.memories);
  const removeEvent = useEventsStore((s) => s.removeEvent);

  function handleDelete(event: Event) {
    Alert.alert(
      t.memories.deleteTitle,
      t.memories.deleteMessage(event.title),
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: () => removeEvent(event.id),
        },
      ],
    );
  }

  const bg = isDark ? '#1A1A1A' : '#F5F5F0';
  const textColor = isDark ? '#F5F5F5' : '#2D2D2D';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 22, paddingTop: 10, paddingBottom: 6 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: textColor, letterSpacing: -0.5 }}>
          {t.memories.title}
        </Text>
        <Text style={{ fontSize: 13, color: '#9B9B9B', marginTop: 2 }}>
          {memories.length > 0
            ? (memories.length === 1 ? t.memories.count_one : t.memories.count_other).replace('{{count}}', String(memories.length))
            : t.memories.emptySubtitle}
        </Text>
      </View>

      {memories.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 16 }}>
          <Logo size="large" showText={false} opacity={0.35} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: textColor, textAlign: 'center' }}>
            {t.memories.emptyTitle}
          </Text>
          <Text style={{ fontSize: 14, color: '#9B9B9B', textAlign: 'center', lineHeight: 20 }}>
            {t.memories.emptyDescription}
          </Text>
        </View>
      ) : (
        <FlatList
          data={memories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: H_PAD, gap: 10 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <MemoryCard
              event={item}
              index={index}
              onPress={() => router.push(`/event/${item.id}`)}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
