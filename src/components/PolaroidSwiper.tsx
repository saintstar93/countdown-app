import { View } from 'react-native';
import type { Event } from '~/types/event';
import PolaroidCard from './PolaroidCard';

interface PolaroidSwiperProps {
  events: Event[];
  onEventPress?: (event: Event) => void;
}

export default function PolaroidSwiper({ events }: PolaroidSwiperProps) {
  if (events.length === 0) return null;

  return (
    <View className="flex-1 items-center justify-center">
      <PolaroidCard event={events[0]} />
    </View>
  );
}
