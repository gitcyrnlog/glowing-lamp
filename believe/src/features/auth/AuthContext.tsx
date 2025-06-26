import { createContext, useContext, ReactNode } from 'react';
import { useAuth, AuthUser } from '../../hooks/useAuth';
import { UserCredential } from 'firebase/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string, displayName: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading, login, signUp, loginWithGoogle, logout } = useAuth();

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
