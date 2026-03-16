import '../global.css';

import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Platform, View } from 'react-native';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { supabase } from '~/services/supabase';
import { useAuthStore } from '~/store/authStore';
import { useSettingsStore } from '~/store/settingsStore';
import { useIsDark } from '~/hooks/useTheme';
import { useEventsStore } from '~/store/eventsStore';
import { requestNotificationPermissions } from '~/services/notifications';
import WebBanner from '~/components/WebBanner';
import { useTranslation } from '~/i18n';

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
  const isDark = useIsDark();
  const t = useTranslation();
  const { isAuthenticated, user, setUser } = useAuthStore();
  const loadProfile = useSettingsStore((s) => s.loadProfile);
  const loadFromSupabase = useEventsStore((s) => s.loadFromSupabase);
  const segments = useSegments();
  const router = useRouter();

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
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerBackTitle: '' }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="event/create" options={{ presentation: 'modal', title: t.event.createTitle }} />
            <Stack.Screen name="event/[id]" options={{ title: t.event.detailTitle }} />
            <Stack.Screen name="event/edit/[id]" options={{ title: t.event.editTitle }} />
            <Stack.Screen name="suggestions" options={{ title: t.suggestions.title }} />
            <Stack.Screen name="calendar-sync" options={{ title: t.calendarSync.title }} />
            <Stack.Screen name="image-search" options={{ presentation: 'modal', title: t.imageSearch.title }} />
          </Stack>
          <WebBanner />
        </View>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
