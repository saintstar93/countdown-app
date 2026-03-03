import { View, Text, Image, Dimensions, useColorScheme } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import type { ViewStyle } from 'react-native';
import type { Event, CountdownFormat } from '~/types/event';
import CountdownDisplay from './CountdownDisplay';
import { DEFAULT_COUNTDOWN_FORMAT } from '~/constants/countdown';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const CARD_WIDTH = Math.min(Math.round(SCREEN_WIDTH * 0.72), 280);
const CARD_PADDING = 10;
export const IMAGE_INNER_SIZE = CARD_WIDTH - CARD_PADDING * 2;
const BOTTOM_HEIGHT = Math.round(CARD_WIDTH * 0.30);
export const CARD_HEIGHT = CARD_PADDING + IMAGE_INNER_SIZE + BOTTOM_HEIGHT;

interface PolaroidCardProps {
  event: Event;
  format?: CountdownFormat;
  animatedStyle?: AnimatedStyle<ViewStyle>;
}

export default function PolaroidCard({
  event,
  format = DEFAULT_COUNTDOWN_FORMAT,
  animatedStyle,
}: PolaroidCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Animated.View
      style={[
        {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          backgroundColor: isDark ? '#2C2C2C' : '#FAFAFA',
          borderRadius: 3,
          padding: CARD_PADDING,
          paddingBottom: 0,
          // Shadow
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.45 : 0.18,
          shadowRadius: 12,
          elevation: 10,
        },
        animatedStyle,
      ]}
    >
      {/* Image area */}
      <View
        style={{
          width: IMAGE_INNER_SIZE,
          height: IMAGE_INNER_SIZE,
          backgroundColor: isDark ? '#3A3A3A' : '#E5E7EB',
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
          <View
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 48 }}>📸</Text>
          </View>
        )}
      </View>

      {/* Bottom white area: title + countdown */}
      <View
        style={{
          height: BOTTOM_HEIGHT,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          paddingHorizontal: 4,
        }}
      >
        <Text
          style={{
            color: isDark ? '#F5F0E8' : '#1a1a1a',
            fontSize: 14,
            fontWeight: '700',
            textAlign: 'center',
            lineHeight: 18,
          }}
          numberOfLines={2}
        >
          {event.title}
        </Text>
        <CountdownDisplay
          targetDate={event.date}
          format={format}
        />
      </View>
    </Animated.View>
  );
}
