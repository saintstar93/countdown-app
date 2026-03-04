import { View, Text, Image, Dimensions, useColorScheme } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import type { ViewStyle } from 'react-native';
import type { Event } from '~/types/event';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Polaroid dimensions — wider card, thick bottom strip like a real polaroid
export const CARD_WIDTH = Math.min(Math.round(SCREEN_WIDTH * 0.78), 300);
const SIDE_PADDING = 14;     // white border on top and sides
const BOTTOM_AREA = 88;      // thick white strip at bottom (title + date + location)
export const IMAGE_SIZE = CARD_WIDTH - SIDE_PADDING * 2;
export const CARD_HEIGHT = SIDE_PADDING + IMAGE_SIZE + BOTTOM_AREA;

const MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
                'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

interface PolaroidCardProps {
  event: Event;
  animatedStyle?: AnimatedStyle<ViewStyle>;
}

export default function PolaroidCard({ event, animatedStyle }: PolaroidCardProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <Animated.View
      style={[
        {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
          borderRadius: 4,
          padding: SIDE_PADDING,
          paddingBottom: 0,
          shadowColor: '#000000',
          shadowOffset: { width: 3, height: 10 },
          shadowOpacity: isDark ? 0.55 : 0.22,
          shadowRadius: 18,
          elevation: 14,
        },
        animatedStyle,
      ]}
    >
      {/* Photo area — square, fills the top portion */}
      <View
        style={{
          width: IMAGE_SIZE,
          height: IMAGE_SIZE,
          backgroundColor: isDark ? '#3A3A3A' : '#D1D5DB',
          overflow: 'hidden',
        }}
      >
        {event.imageUrl ? (
          <Image
            source={{ uri: event.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode={event.imageObjectFit === 'contain' ? 'contain' : 'cover'}
            accessibilityLabel={event.imageAlt ?? event.title}
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 48 }}>📸</Text>
          </View>
        )}
      </View>

      {/* White bottom strip: title, date (accent), location (gray) */}
      <View
        style={{
          height: BOTTOM_AREA,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          paddingHorizontal: 8,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: isDark ? '#FFFFFF' : '#111827',
            textAlign: 'center',
            letterSpacing: -0.2,
          }}
          numberOfLines={1}
        >
          {event.title}
        </Text>

        <Text
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: isDark ? '#6CB8FF' : '#4A90E2',
            textAlign: 'center',
          }}
        >
          {formatDate(event.date)}
        </Text>

        {event.location ? (
          <Text
            style={{
              fontSize: 12,
              color: isDark ? '#9CA3AF' : '#6B7280',
              textAlign: 'center',
            }}
            numberOfLines={1}
          >
            {event.location}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
}
