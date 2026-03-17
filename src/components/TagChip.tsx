import { View, Text } from 'react-native';
import type { Tag } from '~/types/event';
import { useTranslation } from '~/i18n';

interface TagChipProps {
  tag: Tag;
}

export default function TagChip({ tag }: TagChipProps) {
  const t = useTranslation();
  return (
    <View
      className="rounded-full px-3 py-1"
      style={{ backgroundColor: tag.color + '33' }}
    >
      <Text className="text-xs font-medium" style={{ color: tag.color }}>
        {(t.defaultTagNames as Record<string, string>)[tag.id] ?? tag.name}
      </Text>
    </View>
  );
}
