import { View, Text, TextInput, Pressable, useColorScheme, type TextInputProps } from 'react-native';
import { useState } from 'react';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string | null;
  secureTextEntry?: boolean;
}

export default function Input({
  label,
  error,
  secureTextEntry,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = secureTextEntry === true;
  const colorScheme = useColorScheme();

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </Text>
      <View
        className={[
          'flex-row items-center h-14 px-4 rounded-xl border',
          'bg-white dark:bg-gray-800',
          error
            ? 'border-red-400 dark:border-red-500'
            : 'border-gray-200 dark:border-gray-600',
        ].join(' ')}
      >
        <TextInput
          className="flex-1 text-base"
          style={{ color: colorScheme === 'dark' ? '#ffffff' : '#1a1a1a' }}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isPassword && !isPasswordVisible}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />
        {isPassword && (
          <Pressable
            onPress={() => setIsPasswordVisible((v) => !v)}
            hitSlop={8}
          >
            <Text className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              {isPasswordVisible ? 'Nascondi' : 'Mostra'}
            </Text>
          </Pressable>
        )}
      </View>
      {error ? (
        <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>
      ) : null}
    </View>
  );
}
