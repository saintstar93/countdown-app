import { View, Text } from 'react-native';
import type { Tag } from '~/types/event';

interface TagChipProps {
  tag: Tag;
}

export default function TagChip({ tag }: TagChipProps) {
  return (
    <View
      className="rounded-full px-3 py-1"
      style={{ backgroundColor: tag.color + '33' }}
    >
      <Text className="text-xs font-medium" style={{ color: tag.color }}>
        {tag.name}
      </Text>
    </View>
  );
}
