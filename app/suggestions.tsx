import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '~/store/authStore';
import { useAccentColor } from '~/hooks/useAccentColor';
import { useIsDark } from '~/hooks/useTheme';
import { useTranslation } from '~/i18n';
import { dbCreateSuggestion } from '~/services/database';

export default function SuggestionsScreen() {
  const t = useTranslation();
  const router = useRouter();
  const isDark = useIsDark();
  const user = useAuthStore((s) => s.user);
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const ACCENT = useAccentColor();

  const bg = isDark ? '#1A1A1A' : '#F5F5F0';
  const cardBg = isDark ? '#242424' : '#FFFFFF';
  const textColor = isDark ? '#F5F5F5' : '#2D2D2D';
  const inputBg = isDark ? '#333333' : '#F0F0F0';

  async function handleSend() {
    const trimmed = text.trim();
    if (trimmed.length < 10) {
      Alert.alert(t.suggestions.tooShortTitle, t.suggestions.tooShortMessage);
      return;
    }
    if (!user) {
      Alert.alert(t.common.error, t.suggestions.notAuthError);
      return;
    }
    setIsSending(true);
    const { error } = await dbCreateSuggestion(user.id, trimmed);
    setIsSending(false);
    if (error) {
      Alert.alert(t.common.error, t.suggestions.sendError);
      return;
    }
    setSent(true);
  }

  const canSend = text.trim().length >= 10;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: t.suggestions.title,
          headerStyle: { backgroundColor: isDark ? '#1A1A1A' : '#F5F5F0' },
          headerTitleStyle: { color: textColor, fontWeight: '700' },
          headerTintColor: '#9B9B9B',
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 22, gap: 20, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {sent ? (
            /* ── Confirmation ── */
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, paddingVertical: 60 }}>
              <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: ACCENT + '20', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="checkmark-circle" size={42} color={ACCENT} />
              </View>
              <Text style={{ fontSize: 24, fontWeight: '800', color: textColor, textAlign: 'center', letterSpacing: -0.5 }}>
                {t.suggestions.successTitle}
              </Text>
              <Text style={{ fontSize: 15, color: '#9B9B9B', textAlign: 'center', lineHeight: 22 }}>
                {t.suggestions.successMessage}
              </Text>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => ({
                  marginTop: 8,
                  backgroundColor: ACCENT,
                  paddingHorizontal: 32,
                  paddingVertical: 15,
                  borderRadius: 50,
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>{t.common.back}</Text>
              </Pressable>
            </View>
          ) : (
            /* ── Form ── */
            <>
              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: textColor, letterSpacing: -0.3 }}>
                  {t.suggestions.heading}
                </Text>
                <Text style={{ fontSize: 14, color: '#9B9B9B', lineHeight: 20 }}>
                  {t.suggestions.subtitle}
                </Text>
              </View>

              <View style={{
                backgroundColor: cardBg,
                borderRadius: 20,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.2 : 0.06,
                shadowRadius: 20,
                elevation: 4,
              }}>
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder={t.suggestions.placeholder}
                  placeholderTextColor="#9B9B9B"
                  multiline
                  maxLength={2000}
                  style={{
                    minHeight: 180,
                    maxHeight: 320,
                    padding: 18,
                    fontSize: 15,
                    color: textColor,
                    textAlignVertical: 'top',
                    lineHeight: 22,
                  }}
                />
                <View style={{ height: 1, backgroundColor: isDark ? '#333333' : '#F0F0F0' }} />
                <Text style={{ fontSize: 11, color: '#9B9B9B', textAlign: 'right', paddingHorizontal: 16, paddingVertical: 10 }}>
                  {t.suggestions.charCount(text.trim().length)}
                </Text>
              </View>

              <Pressable
                onPress={(!isSending && canSend) ? handleSend : undefined}
                style={({ pressed }) => ({
                  backgroundColor: canSend ? ACCENT : (isDark ? '#333333' : '#EEEEEE'),
                  borderRadius: 50,
                  paddingVertical: 16,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                {isSending ? (
                  <ActivityIndicator color={canSend ? '#FFFFFF' : '#9B9B9B'} />
                ) : (
                  <Ionicons
                    name="send-outline"
                    size={18}
                    color={canSend ? '#FFFFFF' : '#9B9B9B'}
                  />
                )}
                <Text style={{ fontWeight: '700', fontSize: 16, color: canSend ? '#FFFFFF' : '#9B9B9B' }}>
                  {isSending ? t.suggestions.sending : t.suggestions.sendButton}
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
