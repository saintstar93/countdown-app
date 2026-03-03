import { useAuthStore } from '~/store/authStore';

export function useAuth() {
  const { user, isLoading, isAuthenticated, signIn, signUp, signOut } = useAuthStore();
  return { user, isLoading, isAuthenticated, signIn, signUp, signOut };
}
