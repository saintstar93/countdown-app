import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
  Linking,
} from 'react-native';
import { useState } from 'react';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '~/hooks/useAuth';
import { validateEmail, validatePassword } from '~/utils/validation';
import Button from '~/components/ui/Button';
import Input from '~/components/ui/Input';
import Logo from '~/components/ui/Logo';

interface FormErrors {
  name?: string | null;
  email?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
  general?: string | null;
}

function validateName(name: string): string | null {
  if (!name.trim()) return 'Il nome è obbligatorio';
  if (name.trim().length < 2) return 'Il nome deve avere almeno 2 caratteri';
  return null;
}

function validateConfirmPassword(password: string, confirm: string): string | null {
  if (!confirm) return 'Conferma la password';
  if (password !== confirm) return 'Le password non coincidono';
  return null;
}

export default function RegisterScreen() {
  const { signUp, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  function clearFieldError(field: keyof FormErrors) {
    setErrors((e) => ({ ...e, [field]: null, general: null }));
  }

  function validate(): boolean {
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmError = validateConfirmPassword(password, confirmPassword);
    setErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmError,
    });
    return !nameError && !emailError && !passwordError && !confirmError;
  }

  async function handleRegister() {
    if (!validate()) return;
    const error = await signUp(email.trim().toLowerCase(), password, name.trim());
    if (error) {
      setErrors({ general: error });
    } else {
      setRegistrationSuccess(true);
    }
  }

  if (registrationSuccess) {
    return (
      <View className="flex-1 items-center justify-center px-6 bg-[#F5F0E8] dark:bg-[#111111]">
        <Text className="text-5xl mb-4">✉️</Text>
        <Text className="text-2xl font-bold text-[#1a1a1a] dark:text-white text-center mb-3">
          Controlla la tua email
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-base text-center mb-8">
          Ti abbiamo inviato un link di verifica a{'\n'}
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
          <Logo size="medium" showText={false} />
          <Text className="text-3xl font-bold text-[#1a1a1a] dark:text-white tracking-tight mt-4">
            Crea Account
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 mt-1">
            Inizia a contare i tuoi momenti
          </Text>
        </View>

        {/* Form Card */}
        <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm shadow-black/10 mb-8">
          <Input
            label="Nome"
            value={name}
            onChangeText={(t) => { setName(t); clearFieldError('name'); }}
            placeholder="Come ti chiami?"
            autoCapitalize="words"
            error={errors.name}
          />

          <Input
            label="Email"
            value={email}
            onChangeText={(t) => { setEmail(t); clearFieldError('email'); }}
            placeholder="nome@esempio.com"
            keyboardType="email-address"
            autoComplete="email"
            error={errors.email}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={(t) => { setPassword(t); clearFieldError('password'); }}
            placeholder="Minimo 8 caratteri"
            secureTextEntry
            autoComplete="new-password"
            error={errors.password}
          />

          <Input
            label="Conferma Password"
            value={confirmPassword}
            onChangeText={(t) => { setConfirmPassword(t); clearFieldError('confirmPassword'); }}
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

          {/* Checkbox consenso — obbligatorio per GDPR e App Store */}
          <Pressable
            onPress={() => setTermsAccepted(v => !v)}
            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: termsAccepted }}
          >
            <View style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              borderWidth: 2,
              borderColor: termsAccepted ? '#E8754A' : '#D1D5DB',
              backgroundColor: termsAccepted ? '#E8754A' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 1,
              flexShrink: 0,
            }}>
              {termsAccepted && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
            <Text className="text-xs text-gray-500 dark:text-gray-400 flex-1 leading-5">
              Ho letto e accetto i{' '}
              <Text
                className="underline text-gray-700 dark:text-gray-300"
                onPress={() => Linking.openURL('https://saintstar93.github.io/nearday/terms.html').catch(() => {})}
              >
                Termini di Servizio
              </Text>
              {' '}e la{' '}
              <Text
                className="underline text-gray-700 dark:text-gray-300"
                onPress={() => Linking.openURL('https://saintstar93.github.io/nearday/privacy.html').catch(() => {})}
              >
                Privacy Policy
              </Text>
            </Text>
          </Pressable>

          <Button
            title="Crea Account"
            onPress={handleRegister}
            isLoading={isLoading}
            disabled={isLoading || !termsAccepted}
          />
        </View>

        {/* Login Link */}
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            Hai già un account?{' '}
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
