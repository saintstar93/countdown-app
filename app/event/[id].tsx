import { View, Text, Image, ScrollView, Pressable, Alert, useColorScheme, Dimensions, Animated, Platform } from 'react-native';
import { useRef, useState } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useEventsStore } from '~/store/eventsStore';
import { useCountdown } from '~/hooks/useCountdown';
import { exportEventToCalendar } from '~/services/calendar';
import { formatDisplayDate } from '~/utils/date';
import { useAccentColor } from '~/hooks/useAccentColor';
import type { Event } from '~/types/event';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const IMAGE_H = SCREEN_H * 0.46;

// ─── Countdown row ────────────────────────────────────────────────────────────

function CountdownRow({ event }: { event: Event }) {
  const { formatted } = useCountdown(event.date, event.countdownFormat ?? 'days');
  const isDark = useColorScheme() === 'dark';
  return (
    <View style={{ alignItems: 'center', paddingVertical: 22 }}>
      <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: '#9B9B9B', marginBottom: 6 }}>
        Mancano
      </Text>
      <Text style={{ fontSize: 34, fontWeight: '800', color: isDark ? '#F5F5F5' : '#2D2D2D', letterSpacing: -0.5 }}>
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
  const removeEvent = useEventsStore((s) => s.removeEvent);
  const event = [...events, ...memories].find((e) => e.id === id);

  const bg = isDark ? '#1A1A1A' : '#F5F5F0';
  const cardBg = isDark ? '#242424' : '#FFFFFF';
  const textColor = isDark ? '#F5F5F5' : '#2D2D2D';
  const ACCENT = useAccentColor();

  const [toastVisible, setToastVisible] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // Swipe navigation (active events only)
  const currentIndex = events.findIndex((e) => e.id === id);

  function navigateTo(nextId: string) {
    router.replace(`/event/${nextId}`);
  }

  const swipeGesture = Gesture.Pan()
    .failOffsetY([-15, 15])
    .activeOffsetX([-25, 25])
    .onEnd((e) => {
      'worklet';
      if (e.translationX < -60 && currentIndex >= 0 && currentIndex < events.length - 1) {
        runOnJS(navigateTo)(events[currentIndex + 1].id);
      } else if (e.translationX > 60 && currentIndex > 0) {
        runOnJS(navigateTo)(events[currentIndex - 1].id);
      }
    });

  function showToast() {
    setToastVisible(true);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToastVisible(false));
  }

  async function handleExport() {
    const result = await exportEventToCalendar(event!);
    if (result.error) {
      Alert.alert('Errore', result.error);
    } else {
      showToast();
    }
  }

  if (!event) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: bg }}>
        <Stack.Screen options={{ title: 'Evento non trovato' }} />
        <Text style={{ color: textColor, fontSize: 16 }}>Evento non trovato.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: ACCENT, borderRadius: 50 }}>
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Torna indietro</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isMemory = memories.some((e) => e.id === id);

  const content = (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['bottom']}>
      {toastVisible && (
        <Animated.View style={{ position: 'absolute', bottom: 48, alignSelf: 'center', zIndex: 99, opacity: toastOpacity, backgroundColor: '#2D2D2D', paddingHorizontal: 22, paddingVertical: 13, borderRadius: 50 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>Evento esportato! 📅</Text>
        </Animated.View>
      )}
      <Stack.Screen
        options={{
          title: event.title,
          headerStyle: { backgroundColor: isDark ? '#1A1A1A' : '#F5F5F0' },
          headerTitleStyle: { color: textColor, fontWeight: '700' },
          headerTintColor: '#9B9B9B',
          headerRight: !isMemory ? () => (
            <Pressable
              onPress={() => router.push(`/event/edit/${event.id}`)}
              hitSlop={8}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, marginRight: 4 })}
            >
              <Ionicons name="create-outline" size={22} color={isDark ? '#F5F5F5' : '#2D2D2D'} />
            </Pressable>
          ) : () => (
            <Pressable
              onPress={() => {
                Alert.alert('Elimina ricordo', 'Vuoi eliminare questo ricordo? L\'azione non è reversibile.', [
                  { text: 'Annulla', style: 'cancel' },
                  {
                    text: 'Elimina',
                    style: 'destructive',
                    onPress: async () => {
                      await removeEvent(event.id);
                      router.back();
                    },
                  },
                ]);
              }}
              hitSlop={8}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, marginRight: 4 })}
            >
              <Ionicons name="trash-outline" size={21} color="#EF4444" />
            </Pressable>
          ),
        }}
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Image ── */}
        <View style={{ width: SCREEN_W, height: IMAGE_H, backgroundColor: isDark ? '#333333' : '#EEEEEE', overflow: 'hidden' }}>
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
                colors={['transparent', 'rgba(0,0,0,0.3)']}
                locations={[0.55, 1]}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: IMAGE_H * 0.4 }}
                pointerEvents="none"
              />
            </>
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="calendar-outline" size={64} color="#9B9B9B" />
            </View>
          )}

          {/* ── Prev / Next arrows (active events only) ── */}
          {!isMemory && currentIndex > 0 && (
            <Pressable
              onPress={() => navigateTo(events[currentIndex - 1].id)}
              hitSlop={10}
              style={({ pressed }) => ({
                position: 'absolute', left: 14, top: '50%', marginTop: -20,
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: 'rgba(0,0,0,0.35)',
                alignItems: 'center', justifyContent: 'center',
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </Pressable>
          )}
          {!isMemory && currentIndex < events.length - 1 && (
            <Pressable
              onPress={() => navigateTo(events[currentIndex + 1].id)}
              hitSlop={10}
              style={({ pressed }) => ({
                position: 'absolute', right: 14, top: '50%', marginTop: -20,
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: 'rgba(0,0,0,0.35)',
                alignItems: 'center', justifyContent: 'center',
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
            </Pressable>
          )}
        </View>

        {/* ── Dot indicator (only for active events with siblings) ── */}
        {!isMemory && events.length > 1 && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: 14 }}>
            {events.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === currentIndex ? 8 : 5,
                  height: i === currentIndex ? 8 : 5,
                  borderRadius: 4,
                  backgroundColor: i === currentIndex ? ACCENT : (isDark ? '#444' : '#CCC'),
                }}
              />
            ))}
          </View>
        )}

        {/* ── Countdown / Memory badge ── */}
        {!isMemory && <CountdownRow event={event} />}
        {isMemory && (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <View style={{ paddingHorizontal: 16, paddingVertical: 6, borderRadius: 50, backgroundColor: ACCENT + '20' }}>
              <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: ACCENT }}>
                Ricordo
              </Text>
            </View>
          </View>
        )}

        {/* ── Details card ── */}
        <View style={{
          marginHorizontal: 20,
          backgroundColor: cardBg,
          borderRadius: 24,
          padding: 22,
          gap: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.2 : 0.06,
          shadowRadius: 20,
          elevation: 4,
        }}>

          {/* Title */}
          <Text style={{ fontSize: 26, fontWeight: '800', color: textColor, fontFamily: event.font ?? undefined, letterSpacing: -0.4 }}>
            {event.title}
          </Text>

          {/* Date */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isDark ? '#333333' : '#F0F0F0', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="calendar-outline" size={16} color="#9B9B9B" />
            </View>
            <Text style={{ fontSize: 15, color: '#9B9B9B', fontWeight: '500' }}>
              {formatDisplayDate(event.date)}
            </Text>
          </View>

          {/* Location */}
          {event.location ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isDark ? '#333333' : '#F0F0F0', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="location-outline" size={16} color="#9B9B9B" />
              </View>
              <Text style={{ fontSize: 15, color: '#9B9B9B', fontWeight: '500' }}>{event.location}</Text>
            </View>
          ) : null}

          {/* Tags */}
          {event.tags.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {event.tags.map((tag) => (
                <View
                  key={tag.id}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50, backgroundColor: tag.color + '22' }}
                >
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: tag.color }} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: tag.color }}>{tag.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Unsplash attribution */}
          {event.imageSource === 'unsplash' && event.imageAuthor && (
            <Text style={{ fontSize: 11, color: '#9B9B9B' }}>
              Foto di {event.imageAuthor} su Unsplash
            </Text>
          )}

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: isDark ? '#333333' : '#F0F0F0' }} />

          {/* Export to calendar */}
          <Pressable
            onPress={handleExport}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              opacity: pressed ? 0.55 : 1,
            })}
          >
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isDark ? '#333333' : '#F0F0F0', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="calendar-outline" size={16} color="#9B9B9B" />
            </View>
            <Text style={{ fontSize: 15, color: '#9B9B9B', fontWeight: '500' }}>Esporta al calendario</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );

  // On web or for memories, no swipe gesture needed
  if (Platform.OS === 'web' || isMemory || events.length <= 1) return content;

  return <GestureDetector gesture={swipeGesture}>{content}</GestureDetector>;
}
