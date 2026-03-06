import { View, Text, FlatList, Pressable, Alert, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEventsStore } from '~/store/eventsStore';
import { useAuthStore } from '~/store/authStore';
import { useAccentColor } from '~/hooks/useAccentColor';
import { useIsDark } from '~/hooks/useTheme';

type CalendarEvent = {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
};

type MonthGroup = {
  key: string;
  label: string;
  data: CalendarEvent[];
};

const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const MONTHS_FULL = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

function groupByMonth(events: CalendarEvent[]): MonthGroup[] {
  const map = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const d = ev.startDate;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(ev);
  }
  return Array.from(map.entries()).map(([key, data]) => {
    const [year, month] = key.split('-').map(Number);
    return { key, label: `${MONTHS_FULL[month]} ${year}`, data };
  });
}

export default function CalendarSyncScreen() {
  const isDark = useIsDark();
  const accent = useAccentColor();
  const user = useAuthStore((s) => s.user);
  const addEvent = useEventsStore((s) => s.addEvent);
  const events = useEventsStore((s) => s.events);

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const bg = isDark ? '#1A1A1A' : '#F5F5F0';
  const cardBg = isDark ? '#242424' : '#FFFFFF';
  const textColor = isDark ? '#F5F5F5' : '#2D2D2D';

  useEffect(() => {
    if (Platform.OS === 'web') return;
    loadCalendarEvents();
  }, []);

  async function loadCalendarEvents() {
    setLoading(true);
    try {
      const CalendarAPI = await import('expo-calendar');
      const { status } = await CalendarAPI.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }
      const calendars = await CalendarAPI.getCalendarsAsync(CalendarAPI.EntityTypes.EVENT);
      const calIds = calendars.map((c) => c.id);
      const now = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 120);
      const rawEvents = await CalendarAPI.getEventsAsync(calIds, now, end);
      const mapped: CalendarEvent[] = rawEvents
        .filter((e) => e.title?.trim())
        .map((e) => ({
          id: e.id,
          title: e.title,
          startDate: new Date(e.startDate),
          endDate: new Date(e.endDate),
          allDay: e.allDay,
        }));
      setCalendarEvents(mapped);
    } catch {
      Alert.alert('Errore', 'Impossibile accedere al calendario.');
    }
    setLoading(false);
  }

  async function handleAdd(ev: CalendarEvent) {
    if (!user?.id) return;
    const error = await addEvent({
      userId: user.id,
      title: ev.title,
      date: ev.startDate.toISOString(),
      countdownFormat: 'days',
      font: undefined,
      imageUrl: undefined,
      imageSource: undefined,
      imageAuthor: undefined,
      imageObjectFit: 'cover',
      tags: [],
    });
    if (error) {
      Alert.alert('Errore', error);
    } else {
      setAddedIds((prev) => new Set(prev).add(ev.id));
    }
  }

  const groups = groupByMonth(calendarEvents);

  // ── Web placeholder ──
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Sync Calendario' }} />
        <Ionicons name="calendar-outline" size={56} color="#9B9B9B" style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: 17, fontWeight: '700', color: textColor, marginBottom: 8 }}>
          Disponibile solo su mobile
        </Text>
        <Text style={{ fontSize: 14, color: '#9B9B9B', textAlign: 'center', paddingHorizontal: 40 }}>
          Scarica l'app su iOS o Android per sincronizzare il tuo calendario.
        </Text>
      </SafeAreaView>
    );
  }

  // ── Permission denied ──
  if (permissionDenied) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Sync Calendario' }} />
        <Ionicons name="lock-closed-outline" size={56} color="#9B9B9B" style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: 17, fontWeight: '700', color: textColor, marginBottom: 8 }}>
          Accesso al calendario negato
        </Text>
        <Text style={{ fontSize: 14, color: '#9B9B9B', textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 }}>
          Vai in Impostazioni → Privacy → Calendario e abilita l'accesso per Countdown.
        </Text>
      </SafeAreaView>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Sync Calendario' }} />
        <Text style={{ color: '#9B9B9B', fontSize: 15 }}>Caricamento eventi...</Text>
      </SafeAreaView>
    );
  }

  // ── Empty ──
  if (calendarEvents.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Sync Calendario' }} />
        <Ionicons name="calendar-outline" size={56} color="#9B9B9B" style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: 17, fontWeight: '700', color: textColor, marginBottom: 8 }}>
          Nessun evento trovato
        </Text>
        <Text style={{ fontSize: 14, color: '#9B9B9B', textAlign: 'center', paddingHorizontal: 40 }}>
          Non ci sono eventi nei prossimi 4 mesi nel tuo calendario.
        </Text>
      </SafeAreaView>
    );
  }

  type ListItem = { type: 'header'; label: string } | { type: 'event'; ev: CalendarEvent };

  const flatItems: ListItem[] = [];
  for (const group of groups) {
    flatItems.push({ type: 'header', label: group.label });
    for (const ev of group.data) {
      flatItems.push({ type: 'event', ev });
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Sync Calendario' }} />

      <FlatList
        data={flatItems}
        keyExtractor={(item, i) => (item.type === 'header' ? `h-${item.label}` : `e-${item.ev.id}-${i}`)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 12 }}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#9B9B9B', letterSpacing: 0.8, textTransform: 'uppercase', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>
                {item.label}
              </Text>
            );
          }

          const { ev } = item;
          const d = ev.startDate;
          const dayNum = d.getDate();
          const dayName = WEEK_DAYS[d.getDay()];
          const isAdded = addedIds.has(ev.id);
          const alreadyExists = events.some((e) => e.title === ev.title);

          return (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: 20,
              marginBottom: 10,
              backgroundColor: cardBg,
              borderRadius: 16,
              padding: 14,
              gap: 14,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.15 : 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}>
              {/* Date block */}
              <View style={{ alignItems: 'center', width: 38 }}>
                <Text style={{ fontSize: 26, fontWeight: '800', color: textColor, lineHeight: 28 }}>{dayNum}</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#9B9B9B' }}>{dayName}</Text>
              </View>

              {/* Left accent bar */}
              <View style={{ width: 3, height: 38, borderRadius: 2, backgroundColor: accent + '80' }} />

              {/* Title + time */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: textColor }} numberOfLines={1}>{ev.title}</Text>
                <Text style={{ fontSize: 12, color: '#9B9B9B', marginTop: 2 }}>
                  {ev.allDay ? 'Tutto il giorno' : `${ev.startDate.getHours().toString().padStart(2, '0')}:${ev.startDate.getMinutes().toString().padStart(2, '0')}`}
                </Text>
              </View>

              {/* Add button */}
              {isAdded || alreadyExists ? (
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: accent + '20', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="checkmark" size={18} color={accent} />
                </View>
              ) : (
                <Pressable
                  onPress={() => handleAdd(ev)}
                  style={({ pressed }) => ({
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 50,
                    backgroundColor: isDark ? '#333' : '#F0F0F0',
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: textColor }}>Aggiungi</Text>
                </Pressable>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
