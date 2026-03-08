import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAccentColor } from '~/hooks/useAccentColor';
import { useIsDark } from '~/hooks/useTheme';

export default function TabLayout() {
  const isDark = useIsDark();
  const accent = useAccentColor();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: isDark ? '#555555' : '#AAAAAA',
        tabBarStyle: {
          backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
          borderTopColor: isDark ? '#2A2A2A' : '#F0F0F0',
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Nearday',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="timer-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          title: 'Ricordi',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profilo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
