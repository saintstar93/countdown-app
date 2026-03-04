import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView, useColorScheme, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SuggestionsScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  const bg = isDark ? '#0D0D0D' : '#F0EEF5';
  const cardBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const mutedColor = isDark ? '#6B7280' : '#9CA3AF';
  const borderColor = isDark ? '#2A2A2A' : '#E5E7EB';

  function handleSend() {
    const trimmed = text.trim();
    if (trimmed.length < 10) {
      Alert.alert('Troppo corto', 'Scrivi almeno 10 caratteri per inviarci il tuo suggerimento.');
      return;
    }
    // Per ora salviamo localmente; collegheremo a Supabase in seguito
    console.log('[Suggestion]', trimmed);
    setSent(true);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Suggerimenti',
          headerStyle: { backgroundColor: isDark ? '#0D0D0D' : '#F0EEF5' },
          headerTitleStyle: { color: textColor, fontWeight: '700' },
          headerTintColor: isDark ? '#9CA3AF' : '#6B7280',
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 20, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {sent ? (
            /* ── Confirmation ── */
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 60 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#6366F1' + '22', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="checkmark-circle" size={40} color="#6366F1" />
              </View>
              <Text style={{ fontSize: 22, fontWeight: '800', color: textColor, textAlign: 'center' }}>
                Grazie!
              </Text>
              <Text style={{ fontSize: 15, color: mutedColor, textAlign: 'center', lineHeight: 22 }}>
                Il tuo suggerimento è stato ricevuto.{'\n'}Lo leggeremo con attenzione.
              </Text>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => ({
                  marginTop: 8,
                  backgroundColor: '#6366F1',
                  paddingHorizontal: 32,
                  paddingVertical: 14,
                  borderRadius: 14,
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>Torna indietro</Text>
              </Pressable>
            </View>
          ) : (
            /* ── Form ── */
            <>
              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: textColor }}>
                  Hai un'idea o un feedback?
                </Text>
                <Text style={{ fontSize: 13, color: mutedColor, lineHeight: 19 }}>
                  Scrivi qui la tua proposta, segnalazione o qualsiasi cosa ti passi per la testa. Ogni suggerimento è prezioso.
                </Text>
              </View>

              <View style={{ backgroundColor: cardBg, borderRadius: 16, borderWidth: 1.5, borderColor }}>
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder="Scrivi il tuo suggerimento..."
                  placeholderTextColor={mutedColor}
                  multiline
                  style={{
                    minHeight: 180,
                    maxHeight: 320,
                    padding: 16,
                    fontSize: 15,
                    color: textColor,
                    textAlignVertical: 'top',
                    lineHeight: 22,
                  }}
                />
                <Text style={{ fontSize: 11, color: mutedColor, textAlign: 'right', paddingHorizontal: 12, paddingBottom: 10 }}>
                  {text.trim().length} caratteri
                </Text>
              </View>

              <Pressable
                onPress={handleSend}
                style={({ pressed }) => ({
                  backgroundColor: text.trim().length >= 10 ? '#6366F1' : (isDark ? '#2A2A2A' : '#E5E7EB'),
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <Ionicons
                  name="send-outline"
                  size={18}
                  color={text.trim().length >= 10 ? '#FFFFFF' : mutedColor}
                />
                <Text style={{
                  fontWeight: '700',
                  fontSize: 16,
                  color: text.trim().length >= 10 ? '#FFFFFF' : mutedColor,
                }}>
                  Invia suggerimento
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
