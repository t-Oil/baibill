'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface Plan {
  uid: string;
  name: string;
  displayName: string;
  uploadLimit: number;
  canCreateOrg: boolean;
  maxOrganizations: number;
}

interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  plan?: Plan;
  role: {
    name: string;
    permissions: string[];
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  confirmPassword?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth provider component that manages user authentication state.
 * @param children Child components to render within the auth context
 * @returns Auth context provider wrapper
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Checks if the user is authenticated by verifying the token.
   * @returns Promise resolving when auth check is complete
   */
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Call Next.js API route (server-to-server)
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logs in the user with email and password.
   * @param email User's email address
   * @param password User's password
   * @returns Promise resolving when login is successful
   * @throws Error if login fails
   */
  const login = async (email: string, password: string) => {
    // Call Next.js API route (server-to-server)
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Invalid email or password');
    }

    const data = await response.json();
    const accessToken = data.data.accessToken;
    const refreshToken = data.data.refreshToken;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // Fetch user data using the new token (server-to-server)
    const userResponse = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      setUser(userData.data);
      // Dispatch login event to notify other contexts
      window.dispatchEvent(new Event('login'));
      router.push('/dashboard');
    } else {
      throw new Error('Failed to fetch user data');
    }
  };

  /**
   * Registers a new user.
   * @param data Registration data
   * @returns Promise resolving when registration is successful
   * @throws Error if registration fails
   */
  const register = async (data: RegisterData) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const responseData = await response.json();
    return responseData;
  };

  /**
   * Logs out the user and clears authentication tokens.
   */
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access the authentication context.
 * @returns Auth context containing user state and auth methods
 * @throws Error if used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
