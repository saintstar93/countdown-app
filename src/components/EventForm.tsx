import { View, Text } from 'react-native';
import type { Event } from '~/types/event';

interface EventFormProps {
  initialValues?: Partial<Event>;
  onSubmit: (values: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  isLoading?: boolean;
}

// Shared form for create and edit screens — implementation coming in next phase
export default function EventForm({ isLoading }: EventFormProps) {
  return (
    <View className="flex-1 p-4 bg-white dark:bg-gray-900">
      <Text className="text-gray-500 dark:text-gray-400 text-center">
        {isLoading ? 'Caricamento...' : 'Form evento (da implementare)'}
      </Text>
    </View>
  );
}
