import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#ffffff' : '#000000',
        tabBarInactiveTintColor: isDark ? '#888888' : '#aaaaaa',
        tabBarStyle: {
          backgroundColor: isDark ? '#111111' : '#ffffff',
          borderTopColor: isDark ? '#333333' : '#eeeeee',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Countdown',
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          title: 'Ricordi',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profilo',
        }}
      />
    </Tabs>
  );
}
