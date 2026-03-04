import { useRef, useState, useCallback } from 'react';
import { Alert, Text, Pressable, View, useColorScheme } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import EventForm, { type EventFormHandle } from '~/components/EventForm';
import { useEventsStore } from '~/store/eventsStore';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const { events, updateEvent, removeEvent } = useEventsStore();
  const formRef = useRef<EventFormHandle>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  const event = events.find((e) => e.id === id);

  const textColor = isDark ? '#FFFFFF' : '#111827';
  const bg = isDark ? '#0D0D0D' : '#F0EEF5';

  const handleSave = useCallback(() => {
    const data = formRef.current?.submit();
    if (!data) return;
    updateEvent(id, data);
    router.back();
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
          onPress: () => {
            removeEvent(id);
            // Go back to home (pop 2 screens: edit → detail → home)
            router.dismiss(2);
          },
        },
      ]
    );
  }, [id, removeEvent, router]);

  if (!event) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: bg }}>
        <Stack.Screen options={{ title: 'Evento non trovato' }} />
        <Text style={{ color: textColor, fontSize: 16 }}>Evento non trovato.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#6366F1', borderRadius: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Torna indietro</Text>
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
          headerStyle: { backgroundColor: isDark ? '#0D0D0D' : '#F0EEF5' },
          headerTitleStyle: { color: textColor, fontWeight: '700' },
          headerTintColor: isDark ? '#9CA3AF' : '#6B7280',
          headerRight: () => (
            <Pressable
              onPress={isFormValid ? handleSave : undefined}
              hitSlop={12}
              style={{ opacity: isFormValid ? 1 : 0.35 }}
            >
              <Text style={{ color: '#6366F1', fontWeight: '700', fontSize: 16 }}>Salva</Text>
            </Pressable>
          ),
        }}
      />

      <EventForm
        ref={formRef}
        onValidityChange={setIsFormValid}
        initialValues={event}
        allowPastDate
      />

      {/* Delete button rendered below the form — the EventForm ScrollView handles scrolling */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 32, paddingTop: 4, backgroundColor: isDark ? '#0D0D0D' : '#F0EEF5' }}>
        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 15,
            borderRadius: 14,
            backgroundColor: '#FEE2E2',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="trash-outline" size={18} color="#DC2626" />
          <Text style={{ color: '#DC2626', fontWeight: '700', fontSize: 15 }}>Elimina evento</Text>
        </Pressable>
      </View>
    </>
  );
}
