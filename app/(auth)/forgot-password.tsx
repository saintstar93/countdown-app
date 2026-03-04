import { View, Text, KeyboardAvoidingView, ScrollView, Platform, Pressable } from 'react-native';
import { useState } from 'react';
import { Link } from 'expo-router';
import * as Linking from 'expo-linking';

import { supabase } from '~/services/supabase';
import { validateEmail } from '~/utils/validation';
import Button from '~/components/ui/Button';
import Input from '~/components/ui/Input';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }
    setIsLoading(true);
    try {
      // Linking.createURL works in Expo Go (exp://) and in standalone (countdownapp://)
      const redirectTo = Linking.createURL('/reset-password');
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo },
      );
      if (error) {
        setGeneralError(error.message);
      } else {
        setSent(true);
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <View className="flex-1 items-center justify-center px-6 bg-[#F5F0E8] dark:bg-[#111111]">
        <Text style={{ fontSize: 64 }} className="mb-4">✉️</Text>
        <Text className="text-2xl font-bold text-[#1a1a1a] dark:text-white text-center mb-3">
          Controlla la tua email
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-base text-center mb-8">
          Ti abbiamo inviato le istruzioni per reimpostare la password a{'\n'}
          <Text className="font-semibold text-[#1a1a1a] dark:text-white">{email}</Text>
        </Text>
        <Link href="/(auth)/login" asChild>
          <Pressable>
            <Text className="text-[#1a1a1a] dark:text-white font-semibold text-base underline">
              Torna al Login
            </Text>
          </Pressable>
        </Link>
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
          <Text style={{ fontSize: 48 }} className="mb-3">🔑</Text>
          <Text className="text-3xl font-bold text-[#1a1a1a] dark:text-white tracking-tight text-center">
            Password Dimenticata?
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 mt-1 text-center">
            Inserisci la tua email per ricevere{'\n'}le istruzioni di reset
          </Text>
        </View>

        {/* Form Card */}
        <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm shadow-black/10 mb-6">
          <Input
            label="Email"
            value={email}
            onChangeText={(t) => { setEmail(t); setEmailError(null); setGeneralError(null); }}
            placeholder="nome@esempio.com"
            keyboardType="email-address"
            autoComplete="email"
            error={emailError}
          />

          {generalError ? (
            <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
              <Text className="text-red-600 dark:text-red-400 text-sm text-center">
                {generalError}
              </Text>
            </View>
          ) : null}

          <Button
            title="Invia Email di Reset"
            onPress={handleSend}
            isLoading={isLoading}
            disabled={isLoading}
          />
        </View>

        {/* Back to login */}
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            Ricordi la password?{' '}
          </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text className="text-[#1a1a1a] dark:text-white font-semibold text-sm">
                Accedi
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
