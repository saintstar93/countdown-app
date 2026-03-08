import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
} from 'react-native';
import { useState } from 'react';
import { Link } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AntDesign } from '@expo/vector-icons';

import { useAuth } from '~/hooks/useAuth';
import { validateEmail, validatePassword } from '~/utils/validation';
import Button from '~/components/ui/Button';
import Input from '~/components/ui/Input';
import Logo from '~/components/ui/Logo';

interface FormErrors {
  email?: string | null;
  password?: string | null;
  general?: string | null;
}

export default function LoginScreen() {
  const { signIn, signInWithGoogle, signInWithApple, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setErrors({ email: emailError, password: passwordError });
    return !emailError && !passwordError;
  }

  async function handleSignIn() {
    if (!validate()) return;
    const error = await signIn(email.trim().toLowerCase(), password);
    if (error) {
      setErrors({ general: error });
    }
  }

  async function handleGoogleSignIn() {
    const error = await signInWithGoogle();
    if (error) setErrors({ general: error });
  }

  async function handleAppleSignIn() {
    const error = await signInWithApple();
    if (error) setErrors({ general: error });
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
          <Logo size="large" showText={false} />
          <Text className="text-3xl font-bold text-[#1a1a1a] dark:text-white tracking-tight mt-5">
            Nearday
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 mt-1">
            L&apos;attesa diventa bella
          </Text>
        </View>

        {/* Form Card */}
        <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm shadow-black/10 mb-6">
          <Text className="text-xl font-bold text-[#1a1a1a] dark:text-white mb-6">
            Accedi
          </Text>

          <Input
            label="Email"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setErrors((e) => ({ ...e, email: null, general: null }));
            }}
            placeholder="nome@esempio.com"
            keyboardType="email-address"
            autoComplete="email"
            error={errors.email}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setErrors((e) => ({ ...e, password: null, general: null }));
            }}
            placeholder="Minimo 8 caratteri"
            secureTextEntry
            autoComplete="current-password"
            error={errors.password}
          />

          {/* Forgot password */}
          <View className="items-end -mt-2 mb-4">
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Hai dimenticato la password?
                </Text>
              </Pressable>
            </Link>
          </View>

          {errors.general ? (
            <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
              <Text className="text-red-600 dark:text-red-400 text-sm text-center">
                {errors.general}
              </Text>
            </View>
          ) : null}

          <Button
            title="Accedi"
            onPress={handleSignIn}
            isLoading={isLoading}
            disabled={isLoading}
          />
        </View>

        {/* Divider */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <Text className="text-gray-400 dark:text-gray-500 text-sm mx-4">oppure</Text>
          <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </View>

        {/* Social Buttons */}
        <View className="gap-3 mb-8">
          <Button
            title="Continua con Google"
            variant="outline"
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            icon={<AntDesign name="google" size={20} color="#EA4335" />}
          />

          {Platform.OS === 'ios' ? (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={12}
              style={{ height: 56 }}
              onPress={handleAppleSignIn}
            />
          ) : null}
        </View>

        {/* Register Link */}
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            Non hai un account?{' '}
          </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text className="text-[#1a1a1a] dark:text-white font-semibold text-sm">
                Registrati
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
