import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  useOfflineMode: boolean;
  signUp: (email: string, password: string, fullName: string, policyData?: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  refreshProfile: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [useOfflineMode, setUseOfflineMode] = useState(false);

  // Add refs to track current user/profile to prevent unnecessary refetches
  const currentUserRef = useRef<User | null>(null);
  const currentProfileRef = useRef<any | null>(null);
  const isInitializedRef = useRef(false);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('=== FETCHING PROFILE ===');
      console.log('User ID:', userId);
      console.log('Platform:', Platform.OS);

      // If we're in offline mode, create a mock profile
      if (useOfflineMode) {
        const mockProfile = {
          id: userId,
          email: 'demo@example.com',
          full_name: 'Demo User',
          subscription_status: 'active',
          subscription_tier: 'premium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(mockProfile);
        currentProfileRef.current = mockProfile;
        setLoading(false);
        return;
      }

      // Verify we have a valid session before fetching profile
      let user, userError;
      try {
        const response = await supabase.auth.getUser();
        user = response.data.user;
        userError = response.error;
      } catch (fetchError) {
        console.error('Network error fetching user:', fetchError);
        console.error('Switching to offline mode due to connection failure');
        setUseOfflineMode(true);
        setProfile(null);
        currentProfileRef.current = null;
        setLoading(false);
        return;
      }

      if (userError) {
        console.error('Cannot verify user session:', userError);
        // Clear stale user/profile state when session becomes invalid
        setUser(null);
        setProfile(null);
        currentUserRef.current = null;
        currentProfileRef.current = null;
        setLoading(false);
        return;
      }

      if (!user || user.id !== userId) {
        console.error('User session mismatch or no user found - Auth session missing!');
        throw new Error('Auth session missing!');
      }

      console.log('User session verified, querying profiles table...');

      let data, error;
      try {
        const response = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        data = response.data;
        error = response.error;
      } catch (fetchError) {
        console.error('Network error fetching profile:', fetchError);
        console.error('Switching to offline mode due to connection failure');
        setUseOfflineMode(true);
        setProfile(null);
        currentProfileRef.current = null;
        setLoading(false);
        return;
      }

      if (error) {
        console.error('Profile query error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        setProfile(null);
        currentProfileRef.current = null;
      } else {
        console.log('Profile fetched successfully:', data);
        setProfile(data);
        currentProfileRef.current = data;
      }
    } catch (error) {
      console.error('=== PROFILE FETCH FAILED ===');
      console.error('Error type:', error instanceof TypeError ? 'TypeError (Network/CORS issue)' : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Full error:', error);

      setProfile(null);
      currentProfileRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Validate environment variables first
        const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
        const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

        console.log('=== SUPABASE ENVIRONMENT CHECK ===');
        console.log('Platform:', Platform.OS);
        console.log('SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'undefined');
        console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined');

        // Check if Supabase is configured
        if (!supabaseUrl || !supabaseAnonKey) {
          console.warn('Supabase not configured, using offline mode');
          setUseOfflineMode(true);
          setLoading(false);
          return;
        }

        // Test basic connectivity before proceeding
        console.log('Testing Supabase connectivity...');

        // Get initial session
        let session, error;
        try {
          const response = await supabase.auth.getSession();
          session = response.data.session;
          error = response.error;
        } catch (fetchError) {
          console.warn('Supabase connection failed, switching to offline mode:', fetchError);
          console.warn('This could be due to:');
          console.warn('- Missing or incorrect Supabase URL and Anon Key in environment');
          console.warn('- Network connectivity issues');
          console.warn('- CORS configuration in Supabase dashboard');
          console.warn('- Firewall blocking Supabase requests');
          setUseOfflineMode(true);
          setLoading(false);
          return;
        }

        if (error) {
          console.warn('Supabase auth.getSession failed:', error.message);
          console.warn('Full error:', error);

          // Clear any stale user/profile state when session is invalid
          setUser(null);
          setSession(null);
          setProfile(null);
          currentUserRef.current = null;
          currentProfileRef.current = null;
          setUseOfflineMode(true);
          setLoading(false);
          return;
        }

        console.log('Session retrieved successfully:', !!session);

        setSession(session);
        const newUser = session?.user ?? null;
        setUser(newUser);
        currentUserRef.current = newUser;

        if (newUser) {
          console.log('User found in session, fetching profile...');
          await fetchProfile(newUser.id);
        } else {
          console.log('No user in session');
          setLoading(false);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state change event:', event);

            // Only process actual auth changes, not page visibility changes
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
              const newUser = session?.user ?? null;

              // Only update if user actually changed
              const userChanged = currentUserRef.current?.id !== newUser?.id;

              if (userChanged) {
                console.log('User actually changed, updating auth state');
                setSession(session);
                setUser(newUser);
                currentUserRef.current = newUser;

                if (newUser) {
                  await fetchProfile(newUser.id);
                } else {
                  setProfile(null);
                  currentProfileRef.current = null;
                }
              } else {
                console.log('User unchanged, skipping auth state update');
                // Still update session for token refresh
                setSession(session);
              }

              setLoading(false);
            } else {
              console.log('Ignoring auth event:', event);
            }
          }
        );

        isInitializedRef.current = true;
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth initialization failed:', error);
        console.error('Error type:', error instanceof TypeError ? 'TypeError (Network/CORS issue)' : typeof error);
        console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');

        setUseOfflineMode(true);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, policyData?: any) => {
    if (useOfflineMode) {
      // Create mock user for offline mode
      const mockUser = {
        id: 'offline-user',
        email,
        created_at: new Date().toISOString(),
      } as User;

      const mockProfile = {
        id: 'offline-user',
        email,
        full_name: fullName,
        subscription_status: 'active',
        subscription_tier: 'premium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUser(mockUser);
      setProfile(mockProfile);
      currentUserRef.current = mockUser;
      currentProfileRef.current = mockProfile;
      return { data: { user: mockUser }, error: null };
    }

    console.log('AuthContext: Starting sign up process');
    console.log('Email:', email);
    console.log('Full name:', fullName);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          email: email,
          full_name: fullName,
          ...policyData,
        },
      },
    });

    console.log('Supabase signUp response:', { data, error });

    if (error) {
      console.error('Sign up error:', error);
      return { data, error };
    }

    if (data.user) {
      console.log('User created successfully:', data.user.id);
      console.log('Email confirmed:', !!data.user.email_confirmed_at);

      // If email confirmation is disabled, the user will be automatically confirmed
      if (data.user.email_confirmed_at) {
        console.log('User is automatically confirmed, setting auth state');
        setUser(data.user);
        currentUserRef.current = data.user;
        // Profile will be created by the database trigger
        await fetchProfile(data.user.id);
      } else {
        console.log('User needs to confirm email before signing in');
      }
    }

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    if (useOfflineMode) {
      // Create mock user for offline mode
      const mockUser = {
        id: 'offline-user',
        email,
        created_at: new Date().toISOString(),
      } as User;

      const mockProfile = {
        id: 'offline-user',
        email,
        full_name: 'Demo User',
        subscription_status: 'active',
        subscription_tier: 'premium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUser(mockUser);
      setProfile(mockProfile);
      currentUserRef.current = mockUser;
      currentProfileRef.current = mockProfile;
      return { data: { user: mockUser }, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data.session) {
      setSession(data.session);
    }

    return { data, error };
  };

  const signOut = async () => {
    console.log('signOut function called, useOfflineMode:', useOfflineMode);

    if (useOfflineMode) {
      console.log('Signing out in offline mode');
      setUser(null);
      setProfile(null);
      currentUserRef.current = null;
      currentProfileRef.current = null;
      return;
    }

    try {
      console.log('Attempting Supabase sign out');

      // Check if there's an active session before attempting to sign out
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        console.log('Active session found, proceeding with sign out');
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Sign out error:', error);
          throw new Error(error.message);
        }
      } else {
        console.log('No active session found, skipping server sign out');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Always clear local state regardless of server response
      setUser(null);
      setSession(null);
      setProfile(null);
      currentUserRef.current = null;
      currentProfileRef.current = null;
    }
  };

  const resetPassword = async (email: string) => {
    console.log('=== PASSWORD RESET DEBUG ===');
    console.log('Email:', email);
    console.log('useOfflineMode:', useOfflineMode);
    console.log('Platform:', Platform.OS);

    if (useOfflineMode) {
      console.log('In offline mode - returning mock success');
      return { data: null, error: null };
    }

    try {
      console.log('Calling supabase.auth.resetPasswordForEmail...');

      // For mobile apps, use deep linking for password reset
      const redirectTo = Platform.OS === 'web'
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/reset-password.html`
        : 'myglasscase://reset-password';

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      console.log('Supabase resetPasswordForEmail response:');
      console.log('- Data:', data);
      console.log('- Error:', error);
      console.log('=== END PASSWORD RESET DEBUG ===');

      return { data, error };
    } catch (networkError: any) {
      console.error('Network error during password reset:', networkError);
      console.log('=== END PASSWORD RESET DEBUG ===');
      return { data: null, error: { message: 'Network error. Please check your connection and try again.' } };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    useOfflineMode,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshProfile: fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
