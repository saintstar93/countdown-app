import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Pagina non trovata' }} />
      <View className="flex-1 items-center justify-center p-5 bg-white dark:bg-gray-900">
        <Text className="text-gray-900 dark:text-white text-xl font-bold">
          Questa schermata non esiste.
        </Text>
        <Link href="/" className="mt-4 py-4">
          <Text className="text-blue-500 text-sm">Torna alla home</Text>
        </Link>
      </View>
    </>
  );
}
