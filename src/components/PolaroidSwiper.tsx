import { View } from 'react-native';
import { useState, useEffect } from 'react';
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
import { Dimensions } from 'react-native';
import type { Event } from '~/types/event';
import PolaroidCard, { CARD_WIDTH, CARD_HEIGHT } from './PolaroidCard';
import { useSettingsStore } from '~/store/settingsStore';
import { useIsDark } from '~/hooks/useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.22;
const SWIPE_DIST = SCREEN_WIDTH * 0.45;
const SPRING = { damping: 22, stiffness: 200 };

// Stack visual offsets: index 0 = front card, 1 = one behind, 2 = two behind
const STACK = [
  { tx: 0,  ty: 0,   rz: 0,  sc: 1.00 },
  { tx: 24, ty: -6,  rz: 5,  sc: 0.96 },
  { tx: 44, ty: -12, rz: 9,  sc: 0.92 },
] as const;

function StackCard({
  event,
  cardIndex,
  progress,
}: {
  event: Event;
  cardIndex: number;
  progress: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    // Stack position: 0 = front, positive = behind, negative = exiting/entering left
    const sp = cardIndex - progress.value;

    // Hidden: too far outside the visible range
    if (sp < -0.9 || sp > 2.8) {
      return { position: 'absolute' as const, opacity: 0, zIndex: 0 };
    }

    // Exiting left (forward swipe sp: 0 → -1) or re-entering from left (backward swipe sp: -1 → 0)
    if (sp < 0) {
      const tx = interpolate(sp, [-0.9, 0], [-SCREEN_WIDTH * 0.9, 0], Extrapolation.CLAMP);
      const rz = interpolate(sp, [-0.9, 0], [-18, 0], Extrapolation.CLAMP);
      // Fade in quickly from -0.9 to -0.15 so re-entering card appears smoothly
      const op = interpolate(sp, [-0.9, -0.1], [0, 1], Extrapolation.CLAMP);
      return {
        position: 'absolute' as const,
        zIndex: 100, // always on top while in exit/enter transition
        opacity: op,
        transform: [{ translateX: tx }, { rotateZ: `${rz}deg` }],
      };
    }

    // Normal stack position (sp 0, 1, 2)
    const tx = interpolate(sp, [0, 1, 2], [STACK[0].tx, STACK[1].tx, STACK[2].tx], Extrapolation.CLAMP);
    const ty = interpolate(sp, [0, 1, 2], [STACK[0].ty, STACK[1].ty, STACK[2].ty], Extrapolation.CLAMP);
    const rz = interpolate(sp, [0, 1, 2], [STACK[0].rz, STACK[1].rz, STACK[2].rz], Extrapolation.CLAMP);
    const sc = interpolate(sp, [0, 1, 2], [STACK[0].sc, STACK[1].sc, STACK[2].sc], Extrapolation.CLAMP);
    const op = interpolate(sp, [2.3, 2.8], [1, 0], Extrapolation.CLAMP);
    const zi = Math.round(80 - Math.floor(sp) * 20);

    return {
      position: 'absolute' as const,
      zIndex: zi,
      opacity: op,
      transform: [
        { translateX: tx },
        { translateY: ty },
        { rotateZ: `${rz}deg` },
        { scale: sc },
      ],
    };
  });

  return <PolaroidCard event={event} animatedStyle={animatedStyle} />;
}

interface PolaroidSwiperProps {
  events: Event[];
  onIndexChange?: (index: number) => void;
  onEventPress?: (event: Event) => void;
}

export default function PolaroidSwiper({ events, onIndexChange, onEventPress }: PolaroidSwiperProps) {
  const [displayIndex, setDisplayIndex] = useState(0);
  const progress = useSharedValue(0);
  const currentIndexSV = useSharedValue(0);
  const eventCountSV = useSharedValue(events.length);

  // Sync eventCountSV when events array changes (e.g. after adding a new event)
  useEffect(() => {
    eventCountSV.value = events.length;
  }, [events.length]);

  function updateIndex(next: number) {
    setDisplayIndex(next);
    onIndexChange?.(next);
  }

  function handleCardPress() {
    const event = events[currentIndexSV.value];
    if (event) onEventPress?.(event);
  }

  const tapGesture = Gesture.Tap()
    .maxDuration(300)
    .onEnd(() => {
      runOnJS(handleCardPress)();
    });

  const panGesture = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onUpdate((e) => {
      const tx = e.translationX;
      if (tx < 0) {
        // Forward (left swipe): advance progress
        const atEnd = currentIndexSV.value === eventCountSV.value - 1;
        const mult = atEnd ? 0.12 : 1;
        progress.value = currentIndexSV.value + (-tx * mult) / SWIPE_DIST;
      } else {
        // Backward (right swipe): decrease progress so previous card re-enters from left
        const atStart = currentIndexSV.value === 0;
        const mult = atStart ? 0.12 : 1;
        progress.value = currentIndexSV.value - (tx * mult) / SWIPE_DIST;
      }
    })
    .onEnd((e) => {
      const tx = e.translationX;
      const canNext = currentIndexSV.value < eventCountSV.value - 1;
      const canPrev = currentIndexSV.value > 0;

      if (tx < -SWIPE_THRESHOLD && canNext) {
        const next = currentIndexSV.value + 1;
        currentIndexSV.value = next;
        progress.value = withSpring(next, SPRING);
        runOnJS(updateIndex)(next);
      } else if (tx > SWIPE_THRESHOLD && canPrev) {
        const prev = currentIndexSV.value - 1;
        currentIndexSV.value = prev;
        progress.value = withSpring(prev, SPRING);
        runOnJS(updateIndex)(prev);
      } else {
        progress.value = withSpring(currentIndexSV.value, SPRING);
      }
    });

  const composed = Gesture.Race(panGesture, tapGesture);

  const isDark = useIsDark();
  const dotActive = useSettingsStore((s) => s.accentColor);
  const dotInactive = isDark ? '#3A3A3A' : '#D4D4D4';

  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={composed}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
            {events.map((event, i) => (
              <StackCard
                key={event.id}
                event={event}
                cardIndex={i}
                progress={progress}
              />
            ))}
          </View>
        </View>
      </GestureDetector>

      {/* Dot indicators */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 20,
          gap: 7,
        }}
      >
        {events.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === displayIndex ? 9 : 6,
              height: i === displayIndex ? 9 : 6,
              borderRadius: 5,
              backgroundColor: i === displayIndex ? dotActive : dotInactive,
            }}
          />
        ))}
      </View>
    </View>
  );
}
