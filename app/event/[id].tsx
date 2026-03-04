import { View, Text, Image, ScrollView, Pressable, Alert, useColorScheme, Dimensions } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEventsStore } from '~/store/eventsStore';
import { useCountdown } from '~/hooks/useCountdown';
import { addEventToCalendar } from '~/services/calendar';
import { formatDisplayDate } from '~/utils/date';
import type { Event } from '~/types/event';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const IMAGE_H = SCREEN_H * 0.48;

// ─── Countdown row ────────────────────────────────────────────────────────────

function CountdownRow({ event }: { event: Event }) {
  const { formatted } = useCountdown(event.date, event.countdownFormat ?? 'days');
  const isDark = useColorScheme() === 'dark';
  return (
    <View style={{ alignItems: 'center', paddingVertical: 20 }}>
      <Text style={{ fontSize: 13, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: '#6366F1', marginBottom: 4 }}>
        Mancano
      </Text>
      <Text style={{ fontSize: 32, fontWeight: '800', color: isDark ? '#FFFFFF' : '#111827', letterSpacing: -0.5 }}>
        {formatted}
      </Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const events = useEventsStore((s) => s.events);
  const memories = useEventsStore((s) => s.memories);
  const event = [...events, ...memories].find((e) => e.id === id);

  const bg = isDark ? '#0D0D0D' : '#F0EEF5';
  const cardBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const mutedColor = isDark ? '#6B7280' : '#9CA3AF';

  if (!event) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: bg }}>
        <Stack.Screen options={{ title: 'Evento non trovato' }} />
        <Text style={{ color: textColor, fontSize: 16 }}>Evento non trovato.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#6366F1', borderRadius: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Torna indietro</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isMemory = memories.some((e) => e.id === id);

  async function handleExport() {
    const result = await addEventToCalendar(event!);
    if (result.error) {
      Alert.alert('Errore', result.error);
    } else {
      Alert.alert('Salvato', "Evento aggiunto al calendario.");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: event.title,
          headerStyle: { backgroundColor: isDark ? '#0D0D0D' : '#F0EEF5' },
          headerTitleStyle: { color: textColor, fontWeight: '700' },
          headerTintColor: isDark ? '#9CA3AF' : '#6B7280',
        }}
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* ── Image ── */}
        <View style={{ width: SCREEN_W, height: IMAGE_H, backgroundColor: isDark ? '#1A1A1A' : '#E5E7EB', overflow: 'hidden' }}>
          {event.imageUrl ? (
            <>
              {event.imageObjectFit === 'blur' ? (
                <>
                  <Image
                    source={{ uri: event.imageUrl }}
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                    resizeMode="cover"
                    blurRadius={12}
                  />
                  <Image
                    source={{ uri: event.imageUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                  />
                </>
              ) : (
                <Image
                  source={{ uri: event.imageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode={event.imageObjectFit === 'center' ? 'cover' : (event.imageObjectFit ?? 'cover')}
                />
              )}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.35)']}
                locations={[0.5, 1]}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: IMAGE_H * 0.45 }}
                pointerEvents="none"
              />
            </>
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="calendar-outline" size={64} color={mutedColor} />
            </View>
          )}
        </View>

        {/* ── Countdown ── */}
        {!isMemory && <CountdownRow event={event} />}
        {isMemory && (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: mutedColor }}>
              Ricordo
            </Text>
          </View>
        )}

        {/* ── Details card ── */}
        <View style={{ marginHorizontal: 16, backgroundColor: cardBg, borderRadius: 16, padding: 20, gap: 16 }}>

          {/* Title */}
          <Text style={{ fontSize: 26, fontWeight: '800', color: textColor, fontFamily: event.font ?? undefined, letterSpacing: -0.3 }}>
            {event.title}
          </Text>

          {/* Date */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="calendar-outline" size={16} color={mutedColor} />
            <Text style={{ fontSize: 15, color: mutedColor, fontWeight: '500' }}>
              {formatDisplayDate(event.date)}
            </Text>
          </View>

          {/* Location */}
          {event.location ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="location-outline" size={16} color={mutedColor} />
              <Text style={{ fontSize: 15, color: mutedColor, fontWeight: '500' }}>{event.location}</Text>
            </View>
          ) : null}

          {/* Tags */}
          {event.tags.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {event.tags.map((tag) => (
                <View
                  key={tag.id}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: tag.color + '22' }}
                >
                  <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: tag.color }} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: tag.color }}>{tag.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Unsplash attribution */}
          {event.imageSource === 'unsplash' && event.imageAuthor && (
            <Text style={{ fontSize: 11, color: mutedColor }}>
              Foto di {event.imageAuthor} su Unsplash
            </Text>
          )}
        </View>

        {/* ── Action buttons ── */}
        <View style={{ marginHorizontal: 16, marginTop: 16, gap: 12 }}>
          {!isMemory && (
            <Pressable
              onPress={() => router.push(`/event/edit/${event.id}`)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: '#6366F1',
                borderRadius: 14,
                paddingVertical: 16,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Modifica</Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleExport}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: cardBg,
              borderRadius: 14,
              paddingVertical: 16,
              borderWidth: 1.5,
              borderColor: isDark ? '#2A2A2A' : '#E5E7EB',
              opacity: pressed ? 0.65 : 1,
            })}
          >
            <Ionicons name="calendar-outline" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text style={{ color: textColor, fontWeight: '600', fontSize: 16 }}>Esporta al calendario</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
