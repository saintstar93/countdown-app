import { View, Text, Image, Dimensions } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import type { ViewStyle } from 'react-native';
import type { Event } from '~/types/event';
import { useCountdown } from '~/hooks/useCountdown';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Bigger card — fills more of the screen
export const CARD_WIDTH = Math.min(Math.round(SCREEN_WIDTH * 0.86), 340);
const SIDE_PADDING = 14;       // white border on top and sides
const BOTTOM_AREA = 112;       // thick white strip at bottom (title + date + countdown)
export const IMAGE_SIZE = CARD_WIDTH - SIDE_PADDING * 2;
export const CARD_HEIGHT = SIDE_PADDING + IMAGE_SIZE + BOTTOM_AREA;

const MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
                'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function CountdownLine({ event }: { event: Event }) {
  const { formatted } = useCountdown(event.date, event.countdownFormat ?? 'days');
  return (
    <Text
      style={{
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
        letterSpacing: 0.1,
      }}
      numberOfLines={1}
    >
      Mancano {formatted}
    </Text>
  );
}

interface PolaroidCardProps {
  event: Event;
  animatedStyle?: AnimatedStyle<ViewStyle>;
}

export default function PolaroidCard({ event, animatedStyle }: PolaroidCardProps) {
  return (
    <Animated.View
      style={[
        {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          // Always white — the white border IS the polaroid
          backgroundColor: '#FFFFFF',
          borderRadius: 4,
          padding: SIDE_PADDING,
          paddingBottom: 0,
          shadowColor: '#000000',
          shadowOffset: { width: 3, height: 12 },
          shadowOpacity: 0.28,
          shadowRadius: 20,
          elevation: 16,
        },
        animatedStyle,
      ]}
    >
      {/* Photo area */}
      <View
        style={{
          width: IMAGE_SIZE,
          height: IMAGE_SIZE,
          backgroundColor: '#D1D5DB',
          overflow: 'hidden',
        }}
      >
        {event.imageUrl ? (
          <>
            {event.imageObjectFit === 'blur' && (
              <Image
                source={{ uri: event.imageUrl }}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
                resizeMode="cover"
                blurRadius={14}
                accessibilityElementsHidden
              />
            )}
            <Image
              source={{ uri: event.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode={
                event.imageObjectFit === 'contain' || event.imageObjectFit === 'blur'
                  ? 'contain'
                  : 'cover'
              }
              accessibilityLabel={event.imageAlt ?? event.title}
            />
          </>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 48 }}>📸</Text>
          </View>
        )}
      </View>

      {/* White bottom strip — always white background */}
      <View
        style={{
          height: BOTTOM_AREA,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          paddingHorizontal: 8,
        }}
      >
        {/* Title — always black on white polaroid */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: '#111827',
            textAlign: 'center',
            letterSpacing: -0.2,
            fontFamily: event.font ?? undefined,
          }}
          numberOfLines={1}
        >
          {event.title}
        </Text>

        {/* Date — blue accent */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: '#4A90E2',
            textAlign: 'center',
          }}
        >
          {formatDate(event.date)}
        </Text>

        {/* Countdown — dark gray */}
        <CountdownLine event={event} />
      </View>
    </Animated.View>
  );
}
