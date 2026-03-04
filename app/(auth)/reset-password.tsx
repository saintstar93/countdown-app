import { View, Text, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { supabase } from '~/services/supabase';
import { validatePassword } from '~/utils/validation';
import Button from '~/components/ui/Button';
import Input from '~/components/ui/Input';

interface FormErrors {
  password?: string | null;
  confirmPassword?: string | null;
  general?: string | null;
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isExchanging, setIsExchanging] = useState(false);
  const [success, setSuccess] = useState(false);

  // PKCE flow: if a ?code= param is in the URL, exchange it for a session first
  useEffect(() => {
    if (code) {
      setIsExchanging(true);
      supabase.auth
        .exchangeCodeForSession(code)
        .catch(() => {/* session will be handled by onAuthStateChange */})
        .finally(() => setIsExchanging(false));
    }
  }, [code]);

  function validate(): boolean {
    const passwordError = validatePassword(password);
    const confirmError = password !== confirmPassword ? 'Le password non coincidono' : null;
    setErrors({ password: passwordError, confirmPassword: confirmError });
    return !passwordError && !confirmError;
  }

  async function handleReset() {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setErrors({ general: error.message });
      } else {
        setSuccess(true);
        await supabase.auth.signOut();
        router.replace('/(auth)/login');
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (isExchanging) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F5F0E8] dark:bg-[#111111]">
        <Text className="text-base text-gray-500 dark:text-gray-400">Verifica in corso...</Text>
      </View>
    );
  }

  if (success) {
    return (
      <View className="flex-1 items-center justify-center px-6 bg-[#F5F0E8] dark:bg-[#111111]">
        <Text style={{ fontSize: 64 }} className="mb-4">✅</Text>
        <Text className="text-2xl font-bold text-[#1a1a1a] dark:text-white text-center mb-3">
          Password aggiornata!
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-base text-center">
          Reindirizzamento al login...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F5F0E8] dark:bg-[#111111]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-10">
          <Text style={{ fontSize: 48 }} className="mb-3">🔒</Text>
          <Text className="text-3xl font-bold text-[#1a1a1a] dark:text-white tracking-tight">
            Nuova Password
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 mt-1 text-center">
            Scegli una nuova password sicura
          </Text>
        </View>

        {/* Form Card */}
        <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm shadow-black/10">
          <Input
            label="Nuova Password"
            value={password}
            onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: null })); }}
            placeholder="Minimo 8 caratteri"
            secureTextEntry
            autoComplete="new-password"
            error={errors.password}
          />

          <Input
            label="Conferma Password"
            value={confirmPassword}
            onChangeText={(t) => { setConfirmPassword(t); setErrors((e) => ({ ...e, confirmPassword: null })); }}
            placeholder="Ripeti la password"
            secureTextEntry
            autoComplete="new-password"
            error={errors.confirmPassword}
          />

          {errors.general ? (
            <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
              <Text className="text-red-600 dark:text-red-400 text-sm text-center">
                {errors.general}
              </Text>
            </View>
          ) : null}

          <Button
            title="Aggiorna Password"
            onPress={handleReset}
            isLoading={isLoading}
            disabled={isLoading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
