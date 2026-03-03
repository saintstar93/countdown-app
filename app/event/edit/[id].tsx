import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <Text className="text-gray-900 dark:text-white text-lg">Modifica evento {id}</Text>
    </View>
  );
}
