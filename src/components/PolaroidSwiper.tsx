import { View, Dimensions } from 'react-native';
import { useState } from 'react';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import type { Event, CountdownFormat } from '~/types/event';
import PolaroidCard, { CARD_WIDTH, CARD_HEIGHT } from './PolaroidCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 28;
const CARD_OFFSET = CARD_WIDTH + CARD_GAP;
const BASE_OFFSET = (SCREEN_WIDTH - CARD_WIDTH) / 2;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.20;
const SPRING = { damping: 22, stiffness: 220 };

// Internal component: one animated card in the belt
function AnimatedCard({
  event,
  format,
  index,
  progress,
}: {
  event: Event;
  format: CountdownFormat;
  index: number;
  progress: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const offset = Math.abs(index - progress.value);
    const scale = interpolate(offset, [0, 1, 2], [1, 0.92, 0.87], Extrapolation.CLAMP);
    return { transform: [{ scale }] };
  });

  return <PolaroidCard event={event} format={format} animatedStyle={animatedStyle} />;
}

interface PolaroidSwiperProps {
  events: Event[];
  format: CountdownFormat;
}

export default function PolaroidSwiper({ events, format }: PolaroidSwiperProps) {
  const [displayIndex, setDisplayIndex] = useState(0);
  const progress = useSharedValue(0);
  const currentIndexSV = useSharedValue(0);
  const eventCountSV = useSharedValue(events.length);

  // Swipe RIGHT (translationX > 0) → next event (more distant, index++)
  // Swipe LEFT  (translationX < 0) → prev event (closer,    index--)
  const panGesture = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onUpdate((e) => {
      const atLeft = currentIndexSV.value === 0 && e.translationX < 0;
      const atRight = currentIndexSV.value === eventCountSV.value - 1 && e.translationX > 0;
      const mult = atLeft || atRight ? 0.12 : 1;
      progress.value = currentIndexSV.value + (e.translationX * mult) / CARD_OFFSET;
    })
    .onEnd((e) => {
      let next = currentIndexSV.value;
      if (e.translationX > SWIPE_THRESHOLD && next < eventCountSV.value - 1) {
        next += 1;
      } else if (e.translationX < -SWIPE_THRESHOLD && next > 0) {
        next -= 1;
      }
      currentIndexSV.value = next;
      progress.value = withSpring(next, SPRING);
      runOnJS(setDisplayIndex)(next);
    });

  const beltStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: BASE_OFFSET - progress.value * CARD_OFFSET }],
  }));

  return (
    <View style={{ flex: 1 }}>
      {/* Gesture area + card belt */}
      <GestureDetector gesture={panGesture}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Animated.View
            style={[{ flexDirection: 'row', alignItems: 'center', height: CARD_HEIGHT }, beltStyle]}
          >
            {events.map((event, i) => (
              <View key={event.id} style={{ marginRight: CARD_GAP }}>
                <AnimatedCard event={event} format={format} index={i} progress={progress} />
              </View>
            ))}
          </Animated.View>
        </View>
      </GestureDetector>

      {/* Dot indicators */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 28,
          gap: 6,
        }}
      >
        {events.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === displayIndex ? 8 : 5,
              height: i === displayIndex ? 8 : 5,
              borderRadius: 4,
              backgroundColor: i === displayIndex ? '#1a1a1a' : '#9CA3AF',
            }}
          />
        ))}
      </View>
    </View>
  );
}
