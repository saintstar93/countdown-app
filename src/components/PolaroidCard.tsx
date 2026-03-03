import { View, Text, Image } from 'react-native';
import type { Event } from '~/types/event';

interface PolaroidCardProps {
  event: Event;
}

export default function PolaroidCard({ event }: PolaroidCardProps) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-sm shadow-lg p-3 w-72">
      <View className="w-full aspect-square bg-gray-200 dark:bg-gray-700 mb-3">
        {event.imageUrl ? (
          <Image
            source={{ uri: event.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
            accessibilityLabel={event.imageAlt ?? event.title}
          />
        ) : null}
      </View>
      <Text className="text-gray-900 dark:text-white font-medium text-base text-center">
        {event.title}
      </Text>
    </View>
  );
}
