import { View, Text } from 'react-native';
import type { CountdownFormat } from '~/types/event';
import { useCountdown } from '~/hooks/useCountdown';

interface CountdownDisplayProps {
  targetDate: string;
  format: CountdownFormat;
}

export default function CountdownDisplay({ targetDate, format }: CountdownDisplayProps) {
  const { formatted } = useCountdown(targetDate, format);

  return (
    <View className="items-center">
      <Text className="text-gray-900 dark:text-white text-2xl font-bold">{formatted}</Text>
    </View>
  );
}
