import { View, Dimensions, useColorScheme } from 'react-native';
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
import type { Event } from '~/types/event';
import PolaroidCard, { CARD_WIDTH, CARD_HEIGHT } from './PolaroidCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Swipe threshold to commit to a transition
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.22;
// Distance over which the forward animation runs (0 → 1 in progress)
const SWIPE_DIST = SCREEN_WIDTH * 0.45;
const SPRING = { damping: 22, stiffness: 200 };

// Stack visual positions: index 0 = front, 1 = one behind, 2 = two behind
const STACK = [
  { tx: 0,  ty: 0,   rz: 0,  sc: 1.00 },
  { tx: 24, ty: -6,  rz: 5,  sc: 0.96 },
  { tx: 44, ty: -12, rz: 9,  sc: 0.92 },
] as const;

// Per-card animated stack component — reads progress + dragX from parent
function StackCard({
  event,
  cardIndex,
  progress,
  dragX,
  currentIndexSV,
}: {
  event: Event;
  cardIndex: number;
  progress: SharedValue<number>;
  dragX: SharedValue<number>;
  currentIndexSV: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    // Stack position: 0 = front, positive = behind, negative = exiting
    const sp = cardIndex - progress.value;

    // === BACKWARD DRAG: top card follows finger to the right ===
    if (dragX.value > 0 && sp > -0.05 && sp < 0.05) {
      const rz = interpolate(dragX.value, [0, SCREEN_WIDTH], [0, 15], Extrapolation.CLAMP);
      return {
        position: 'absolute' as const,
        zIndex: 100,
        opacity: 1,
        transform: [{ translateX: dragX.value }, { rotateZ: `${rz}deg` }],
      };
    }

    // === HIDDEN: too far behind or fully exited ===
    if (sp < -0.8 || sp > 2.8) {
      return { position: 'absolute' as const, opacity: 0, zIndex: 0 };
    }

    // === EXITING LEFT (forward swipe): sp going from 0 to -1 ===
    if (sp < 0) {
      const tx = interpolate(sp, [-0.8, 0], [-SCREEN_WIDTH * 0.9, 0], Extrapolation.CLAMP);
      const rz = interpolate(sp, [-0.8, 0], [-20, 0], Extrapolation.CLAMP);
      const op = interpolate(sp, [-0.5, 0], [0, 1], Extrapolation.CLAMP);
      return {
        position: 'absolute' as const,
        zIndex: 90,
        opacity: op,
        transform: [{ translateX: tx }, { rotateZ: `${rz}deg` }],
      };
    }

    // === STACK POSITION (sp 0, 1, 2) ===
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
}

export default function PolaroidSwiper({ events, onIndexChange }: PolaroidSwiperProps) {
  const [displayIndex, setDisplayIndex] = useState(0);
  // progress: float belt value — 0 = first card at front, 1 = second card at front, etc.
  const progress = useSharedValue(0);
  // dragX: only used during backward (right) swipe for top-card offset
  const dragX = useSharedValue(0);
  const currentIndexSV = useSharedValue(0);
  const eventCountSV = useSharedValue(events.length);

  function updateIndex(next: number) {
    setDisplayIndex(next);
    onIndexChange?.(next);
  }

  const panGesture = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onUpdate((e) => {
      const tx = e.translationX;
      if (tx < 0) {
        // === FORWARD (left swipe) — drive the stack belt ===
        dragX.value = 0;
        const atEnd = currentIndexSV.value === eventCountSV.value - 1;
        const mult = atEnd ? 0.12 : 1;
        progress.value = currentIndexSV.value + (-tx * mult) / SWIPE_DIST;
      } else {
        // === BACKWARD (right swipe) — move top card only, keep belt fixed ===
        progress.value = currentIndexSV.value;
        const atStart = currentIndexSV.value === 0;
        const mult = atStart ? 0.12 : 1;
        dragX.value = tx * mult;
      }
    })
    .onEnd((e) => {
      const tx = e.translationX;
      const canNext = currentIndexSV.value < eventCountSV.value - 1;
      const canPrev = currentIndexSV.value > 0;

      if (tx < -SWIPE_THRESHOLD && canNext) {
        // Complete forward — spring belt to next integer
        const next = currentIndexSV.value + 1;
        currentIndexSV.value = next;
        progress.value = withSpring(next, SPRING);
        dragX.value = 0;
        runOnJS(updateIndex)(next);
      } else if (tx > SWIPE_THRESHOLD && canPrev) {
        // Complete backward — top card exits right, then jump belt
        dragX.value = withSpring(SCREEN_WIDTH * 1.5, SPRING, () => {
          const prev = currentIndexSV.value - 1;
          currentIndexSV.value = prev;
          progress.value = prev;   // instant (no animation)
          dragX.value = 0;
          runOnJS(updateIndex)(prev);
        });
      } else {
        // Snap back
        progress.value = withSpring(currentIndexSV.value, SPRING);
        dragX.value = withSpring(0, SPRING);
      }
    });

  const isDark = useColorScheme() === 'dark';
  const dotActive = isDark ? '#A78BFA' : '#6366F1';
  const dotInactive = isDark ? '#4B5563' : '#D1D5DB';

  return (
    <View style={{ flex: 1 }}>
      {/* Stack area */}
      <GestureDetector gesture={panGesture}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {/* Container sized to top card — behind cards overflow visibly to the right */}
          <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
            {events.map((event, i) => (
              <StackCard
                key={event.id}
                event={event}
                cardIndex={i}
                progress={progress}
                dragX={dragX}
                currentIndexSV={currentIndexSV}
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
