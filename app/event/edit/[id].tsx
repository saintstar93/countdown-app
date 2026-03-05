import { useRef, useState, useCallback } from 'react';
import { Alert, Text, Pressable, View, ActivityIndicator, useColorScheme } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import EventForm, { type EventFormHandle } from '~/components/EventForm';
import { useEventsStore } from '~/store/eventsStore';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const events = useEventsStore((s) => s.events);
  const updateEvent = useEventsStore((s) => s.updateEvent);
  const removeEvent = useEventsStore((s) => s.removeEvent);
  const formRef = useRef<EventFormHandle>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const event = events.find((e) => e.id === id);

  const textColor = isDark ? '#FFFFFF' : '#111827';
  const bg = isDark ? '#0D0D0D' : '#F5F5F5';
  const accent = isDark ? '#FFFFFF' : '#111827';
  const accentText = isDark ? '#111827' : '#FFFFFF';
  const busy = isSaving || isDeleting;

  const handleSave = useCallback(async () => {
    const data = formRef.current?.submit();
    if (!data) return;
    setIsSaving(true);
    const error = await updateEvent(id, data);
    setIsSaving(false);
    if (error) {
      Alert.alert('Errore', error);
    } else {
      router.back();
    }
  }, [id, updateEvent, router]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Elimina evento',
      'Sei sicuro di voler eliminare questo evento?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            const error = await removeEvent(id);
            setIsDeleting(false);
            if (error) {
              Alert.alert('Errore', error);
            } else {
              router.dismiss(2);
            }
          },
        },
      ],
    );
  }, [id, removeEvent, router]);

  if (!event) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: bg }}>
        <Stack.Screen options={{ title: 'Evento non trovato' }} />
        <Text style={{ color: textColor, fontSize: 16 }}>Evento non trovato.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: accent, borderRadius: 100 }}>
          <Text style={{ color: accentText, fontWeight: '600' }}>Torna indietro</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Modifica Evento',
          presentation: 'card',
          headerStyle: { backgroundColor: isDark ? '#0D0D0D' : '#F5F5F5' },
          headerTitleStyle: { color: textColor, fontWeight: '700' },
          headerTintColor: isDark ? '#9CA3AF' : '#6B7280',
          headerRight: () => (
            isSaving ? (
              <ActivityIndicator color={accent} />
            ) : (
              <Pressable
                onPress={(isFormValid && !busy) ? handleSave : undefined}
                hitSlop={12}
                style={{ opacity: (isFormValid && !busy) ? 1 : 0.35 }}
              >
                <Text style={{ color: accent, fontWeight: '700', fontSize: 16 }}>Salva</Text>
              </Pressable>
            )
          ),
        }}
      />

      <EventForm
        ref={formRef}
        onValidityChange={setIsFormValid}
        initialValues={event}
        allowPastDate
      />

      {/* Delete button */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 32, paddingTop: 4, backgroundColor: bg }}>
        <Pressable
          onPress={busy ? undefined : handleDelete}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 15,
            borderRadius: 14,
            backgroundColor: '#FEE2E2',
            opacity: busy ? 0.5 : (pressed ? 0.7 : 1),
          })}
        >
          {isDeleting
            ? <ActivityIndicator size="small" color="#DC2626" />
            : <Ionicons name="trash-outline" size={18} color="#DC2626" />
          }
          <Text style={{ color: '#DC2626', fontWeight: '700', fontSize: 15 }}>
            {isDeleting ? 'Eliminazione…' : 'Elimina evento'}
          </Text>
        </Pressable>
      </View>
    </>
  );
}
