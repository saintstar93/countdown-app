import { Platform, View, Text, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WebBanner() {
  if (Platform.OS !== 'web') return null;

  const isDark = useColorScheme() === 'dark';

  return (
    <View style={{
      backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: isDark ? '#2A2A2A' : '#EEEEEE',
      paddingVertical: 10,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    }}>
      <Ionicons name="phone-portrait-outline" size={14} color="#9B9B9B" />
      <Text style={{ flex: 1, fontSize: 12, color: '#9B9B9B', lineHeight: 16 }}>
        Versione anteprima — Scarica l'app per l'esperienza completa
      </Text>
    </View>
  );
}
