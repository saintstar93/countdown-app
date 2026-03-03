import { Text } from 'react-native';
import { useCountdown } from '~/hooks/useCountdown';
import type { CountdownFormat } from '~/types/event';

interface CountdownDisplayProps {
  targetDate: string;
  format: CountdownFormat;
  className?: string;
}

export default function CountdownDisplay({ targetDate, format, className }: CountdownDisplayProps) {
  const { formatted } = useCountdown(targetDate, format);
  return (
    <Text className={className ?? 'text-center text-sm font-medium text-gray-500 dark:text-gray-400'}>
      {formatted}
    </Text>
  );
}
