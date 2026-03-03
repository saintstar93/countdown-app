import { Pressable, Text, ActivityIndicator, View, type PressableProps } from 'react-native';

export type ButtonVariant = 'primary' | 'outline' | 'ghost';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  title,
  variant = 'primary',
  isLoading = false,
  disabled,
  icon,
  fullWidth = true,
  onPress,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const containerClass = [
    'flex-row items-center justify-center rounded-xl h-14 px-6',
    fullWidth ? 'w-full' : '',
    variant === 'primary' ? 'bg-[#1a1a1a] dark:bg-white' : '',
    variant === 'outline' ? 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent' : '',
    variant === 'ghost' ? 'bg-transparent' : '',
    isDisabled ? 'opacity-50' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const textClass = [
    'font-semibold text-base',
    variant === 'primary' ? 'text-white dark:text-[#1a1a1a]' : '',
    variant === 'outline' ? 'text-[#1a1a1a] dark:text-white' : '',
    variant === 'ghost' ? 'text-[#1a1a1a] dark:text-white' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Pressable
      className={containerClass}
      onPress={onPress}
      disabled={isDisabled}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#ffffff' : '#1a1a1a'}
        />
      ) : (
        <>
          {icon ? <View className="mr-2">{icon}</View> : null}
          <Text className={textClass}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}
