import { useAuthStore } from '~/store/authStore';

export function useAuth() {
  const {
    user,
    isLoading,
    isAuthenticated,
    isInitialized,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithApple,
  } = useAuthStore();

  return {
    user,
    isLoading,
    isAuthenticated,
    isInitialized,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithApple,
  };
}
