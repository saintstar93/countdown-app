import { View, Text, Modal, Image, Pressable, Dimensions, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { Event } from '~/types/event';

const { width: W, height: H } = Dimensions.get('window');

const MONTHS_FULL = [
  'GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO',
  'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE',
];

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getDate()} ${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

function getDaysLeft(isoDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(isoDate);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function countdownLabel(days: number): string {
  if (days > 0) return `TRA ${days} ${days === 1 ? 'GIORNO' : 'GIORNI'}`;
  if (days === 0) return 'OGGI';
  return `${Math.abs(days)} ${Math.abs(days) === 1 ? 'GIORNO' : 'GIORNI'} FA`;
}

interface EventFullScreenProps {
  event: Event | null;
  onClose: () => void;
}

export default function EventFullScreen({ event, onClose }: EventFullScreenProps) {
  const insets = useSafeAreaInsets();

  if (!event) return null;

  const daysLeft = getDaysLeft(event.date);

  return (
    <Modal visible animationType="fade" statusBarTranslucent transparent>
      <StatusBar hidden />

      <View style={{ flex: 1, backgroundColor: '#000' }}>

        {/* Full-screen background image */}
        {event.imageUrl ? (
          <Image
            source={{ uri: event.imageUrl }}
            style={{ position: 'absolute', top: 0, left: 0, width: W, height: H }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ position: 'absolute', top: 0, left: 0, width: W, height: H, backgroundColor: '#111' }} />
        )}

        {/* Dark gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.88)']}
          locations={[0, 0.55, 1]}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: H * 0.65 }}
          pointerEvents="none"
        />

        {/* Top bar */}
        <View
          style={{
            position: 'absolute',
            top: insets.top + 10,
            left: 0,
            right: 0,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
          }}
        >
          {/* Close button */}
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: 'rgba(0,0,0,0.35)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="close" size={18} color="#fff" />
          </Pressable>

          {/* Share pill — center */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Pressable
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 20,
                paddingHorizontal: 18,
                paddingVertical: 7,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 0.2 }}>
                Condividi
              </Text>
            </Pressable>
          </View>

          {/* More options */}
          <Pressable
            hitSlop={12}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: 'rgba(0,0,0,0.35)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color="#fff" />
          </Pressable>
        </View>

        {/* Bottom info */}
        <View
          style={{
            position: 'absolute',
            bottom: insets.bottom + 48,
            left: 0,
            right: 0,
            paddingHorizontal: 28,
          }}
        >
          {/* Countdown label */}
          <Text
            style={{
              color: 'rgba(255,255,255,0.70)',
              fontSize: 12,
              fontWeight: '600',
              letterSpacing: 2.5,
              marginBottom: 8,
            }}
          >
            {countdownLabel(daysLeft)}
          </Text>

          {/* Event title */}
          <Text
            style={{
              color: '#fff',
              fontSize: 42,
              fontWeight: '800',
              letterSpacing: -1,
              lineHeight: 46,
            }}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {event.title}
          </Text>

          {/* Date */}
          <Text
            style={{
              color: 'rgba(255,255,255,0.62)',
              fontSize: 13,
              fontWeight: '500',
              letterSpacing: 2,
              marginTop: 12,
            }}
          >
            {formatDate(event.date)}
          </Text>

          {/* Location (if present) */}
          {event.location ? (
            <Text
              style={{
                color: 'rgba(255,255,255,0.50)',
                fontSize: 13,
                fontWeight: '400',
                letterSpacing: 1,
                marginTop: 4,
              }}
            >
              {event.location}
            </Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
