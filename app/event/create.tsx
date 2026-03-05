import { useRef, useState, useCallback } from 'react';
import { Alert, Text, Pressable, ActivityIndicator, useColorScheme } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import EventForm, { type EventFormHandle } from '~/components/EventForm';
import { useEventsStore } from '~/store/eventsStore';
import { useAccentColor } from '~/hooks/useAccentColor';

export default function CreateEventScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const addEvent = useEventsStore((s) => s.addEvent);
  const formRef = useRef<EventFormHandle>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    const data = formRef.current?.submit();
    if (!data) return;
    setIsSaving(true);
    const error = await addEvent(data);
    setIsSaving(false);
    if (error) {
      Alert.alert('Errore', error);
    } else {
      router.back();
    }
  }, [addEvent, router]);

  const ACCENT = useAccentColor();
  const textColor = isDark ? '#F5F5F5' : '#2D2D2D';
  const canSave = isFormValid && !isSaving;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nuovo Evento',
          presentation: 'modal',
          headerStyle: { backgroundColor: isDark ? '#1A1A1A' : '#F5F5F0' },
          headerTitleStyle: { color: textColor, fontWeight: '700' },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={12} disabled={isSaving}>
              <Ionicons name="close" size={22} color="#9B9B9B" />
            </Pressable>
          ),
          headerRight: () => (
            isSaving ? (
              <ActivityIndicator color={ACCENT} />
            ) : (
              <Pressable
                onPress={canSave ? handleSave : undefined}
                hitSlop={12}
                style={{ opacity: canSave ? 1 : 0.35 }}
              >
                <Text style={{ color: ACCENT, fontWeight: '700', fontSize: 16 }}>
                  Salva
                </Text>
              </Pressable>
            )
          ),
        }}
      />
      <EventForm ref={formRef} onValidityChange={setIsFormValid} />
    </>
  );
}
