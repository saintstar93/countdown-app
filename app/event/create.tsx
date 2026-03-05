import { useRef, useState, useCallback } from 'react';
import { Alert, Text, Pressable, ActivityIndicator, useColorScheme } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import EventForm, { type EventFormHandle } from '~/components/EventForm';
import { useEventsStore } from '~/store/eventsStore';

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

  const textColor = isDark ? '#FFFFFF' : '#111827';
  const accentColor = '#6366F1';
  const canSave = isFormValid && !isSaving;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nuovo Evento',
          presentation: 'modal',
          headerStyle: { backgroundColor: isDark ? '#0D0D0D' : '#F0EEF5' },
          headerTitleStyle: { color: textColor, fontWeight: '700' },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={12} disabled={isSaving}>
              <Ionicons name="close" size={22} color={textColor} />
            </Pressable>
          ),
          headerRight: () => (
            isSaving ? (
              <ActivityIndicator color={accentColor} />
            ) : (
              <Pressable
                onPress={canSave ? handleSave : undefined}
                hitSlop={12}
                style={{ opacity: canSave ? 1 : 0.35 }}
              >
                <Text style={{ color: accentColor, fontWeight: '700', fontSize: 16 }}>
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
