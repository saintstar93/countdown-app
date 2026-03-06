import '../global.css';

import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Platform, View, useColorScheme, Appearance } from 'react-native';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { supabase } from '~/services/supabase';
import { useAuthStore } from '~/store/authStore';
import { useSettingsStore } from '~/store/settingsStore';
import { useEventsStore } from '~/store/eventsStore';
import { requestNotificationPermissions } from '~/services/notifications';
import WebBanner from '~/components/WebBanner';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    initialize();
    if (Platform.OS !== 'web') {
      requestNotificationPermissions();
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded && isInitialized) {
      if (Platform.OS !== 'web') SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isInitialized]);

  if (!fontsLoaded || (!isInitialized && Platform.OS !== 'web')) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, user, setUser } = useAuthStore();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const loadProfile = useSettingsStore((s) => s.loadProfile);
  const loadFromSupabase = useEventsStore((s) => s.loadFromSupabase);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      Appearance.setColorScheme(themeMode === 'system' ? null : themeMode);
    }
  }, [themeMode]);

  // On login: load events, tags and profile from Supabase
  useEffect(() => {
    if (user?.id) {
      loadFromSupabase(user.id);
      loadProfile(user.id);
    }
  }, [user?.id]);

  // Keep store in sync with Supabase session changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Navigate to reset-password WITHOUT updating auth state in store
        // (prevents route protection from redirecting to (tabs) before user resets)
        router.replace('/(auth)/reset-password');
        return;
      }
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          displayName: session.user.user_metadata?.display_name as string | undefined,
          avatarUrl: session.user.user_metadata?.avatar_url as string | undefined,
          createdAt: session.user.created_at,
        });
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Route protection
  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerBackTitle: '' }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="event/create" options={{ presentation: 'modal', title: 'Nuovo evento' }} />
            <Stack.Screen name="event/[id]" options={{ title: 'Dettaglio evento' }} />
            <Stack.Screen name="event/edit/[id]" options={{ title: 'Modifica evento' }} />
            <Stack.Screen name="suggestions" options={{ title: 'Suggerimenti' }} />
            <Stack.Screen name="calendar-sync" options={{ title: 'Sync Calendario' }} />
            <Stack.Screen name="image-search" options={{ presentation: 'modal', title: 'Cerca immagine' }} />
          </Stack>
          <WebBanner />
        </View>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
