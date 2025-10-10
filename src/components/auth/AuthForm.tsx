import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Mail, Lock, User, Eye, EyeOff } from 'react-native-vector-icons/Feather';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { POLICY_CONFIG } from '../../config/policyConfig';

interface AuthFormProps {
  mode: 'signin' | 'signup' | 'reset';
  onModeChange: (mode: 'signin' | 'signup' | 'reset') => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onModeChange }) => {
  const { signIn, signUp, resetPassword } = useAuth();
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [agreedToPolicies, setAgreedToPolicies] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setMessage('');
    setLoading(true);

    if (mode === 'signup' && !agreedToPolicies) {
      setError('You must agree to the Terms and Conditions and Privacy Policy to create an account.');
      setLoading(false);
      return;
    }

    console.log('=== EMAIL DEBUG START ===');
    console.log('Raw email value:', email);
    console.log('Email length:', email.length);
    console.log('Email trimmed:', email.trim());
    console.log('=== EMAIL DEBUG END ===');

    const normalizedEmail = email.trim().toLowerCase();
    console.log('Normalized email:', normalizedEmail);
    console.log(`Starting ${mode} process for email:`, email);

    try {
      let result;
      if (mode === 'signin') {
        console.log('Attempting sign in...');
        result = await signIn(normalizedEmail, password);
      } else if (mode === 'signup') {
        console.log('Attempting sign up with full name:', fullName);
        result = await signUp(normalizedEmail, password, fullName, {
          terms_version: POLICY_CONFIG.termsVersion,
          privacy_version: POLICY_CONFIG.privacyVersion,
          policy_agreed_at: new Date().toISOString(),
        });
      } else if (mode === 'reset') {
        console.log('Attempting password reset...');
        result = await resetPassword(normalizedEmail);
        if (!result?.error) {
          setMessage('Check your email for the password reset link');
          setLoading(false);
          return;
        }
      }

      console.log('Auth result:', result);

      if (result?.error) {
        console.error('Auth error:', result.error);
        throw result.error;
      }

      if (mode === 'signup' && result?.data?.user) {
        console.log('Sign-up successful, user created:', result.data.user.id);
        if (result.data.user.email_confirmed_at) {
          setMessage('Account created successfully! Please select your subscription plan.');
        } else {
          setMessage('Account created! Please check your email to confirm your account before signing in.');
        }
      }

    } catch (error: any) {
      console.error('Authentication error:', error);

      if (error?.message) {
        switch (error.message) {
          case 'Invalid login credentials':
            setError('Email not found or incorrect password. If you don\'t have an account yet, please sign up below.');
            break;
          case 'Email not confirmed':
            setError('Please check your email and click the confirmation link before signing in.');
            break;
          case 'User already registered':
            setError('An account with this email already exists. Please sign in instead.');
            break;
          case 'Password should be at least 6 characters':
            setError('Password must be at least 6 characters long.');
            break;
          case 'Invalid email':
            setError('Please enter a valid email address.');
            break;
          case 'Signup is disabled':
            setError('New user registration is currently disabled. Please contact support.');
            break;
          case 'For security purposes, you can only request this once every 60 seconds':
            setError('Please wait 60 seconds before requesting another password reset email.');
            break;
          case 'Unable to validate email address: invalid format':
            setError('Please enter a valid email address.');
            break;
          default:
            if (mode === 'reset') {
              setError('If an account with that email exists, you will receive a password reset link. Please check your inbox and spam folder.');
            } else {
              setError(error.message);
            }
        }
      } else {
        setError(error?.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const openURL = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  const styles = createStyles(isDark);
  const isButtonDisabled = loading || !email || (mode !== 'reset' && !password) || (mode === 'signup' && (!fullName || !agreedToPolicies));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'reset' && 'Reset Password'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'signin' && 'Sign in to access your collection'}
              {mode === 'signup' && 'Join thousands of collectors'}
              {mode === 'reset' && 'Enter your email to reset your password'}
            </Text>
          </View>

          {mode === 'signup' && (
            <View style={styles.policyContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAgreedToPolicies(!agreedToPolicies)}
              >
                <View style={[styles.checkbox, agreedToPolicies && styles.checkboxChecked]}>
                  {agreedToPolicies && <Text style={styles.checkboxCheck}>✓</Text>}
                </View>
                <Text style={styles.policyText}>
                  I agree to the{' '}
                  <Text style={styles.link} onPress={() => openURL(POLICY_CONFIG.termsUrl)}>
                    Terms and Conditions
                  </Text>
                  {' '}and{' '}
                  <Text style={styles.link} onPress={() => openURL(POLICY_CONFIG.privacyUrl)}>
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === 'signup' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <User name="user" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </View>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Mail name="mail" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
              />
            </View>
          </View>

          {mode !== 'reset' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock name="lock" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 48 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password (min 6 characters)"
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff name="eye-off" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  ) : (
                    <Eye name="eye" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {message && (
            <View style={[
              styles.messageContainer,
              message.includes('Check your email') || message.includes('created successfully') || message.includes('Account created')
                ? styles.successMessage
                : styles.errorMessage
            ]}>
              <Text style={[
                styles.messageText,
                message.includes('Check your email') || message.includes('created successfully') || message.includes('Account created')
                  ? styles.successText
                  : styles.errorText
              ]}>
                {message}
              </Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isButtonDisabled}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'signin' ? 'Sign In' :
                  mode === 'signup' ? 'Create Account' :
                    'Send Reset Link'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            {mode === 'signin' && (
              <>
                <TouchableOpacity onPress={() => onModeChange('reset')}>
                  <Text style={styles.linkButton}>Forgot your password?</Text>
                </TouchableOpacity>
                <Text style={styles.footerText}>Don't have an account?</Text>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => onModeChange('signup')}
                >
                  <Text style={styles.buttonText}>Create Account</Text>
                </TouchableOpacity>

                <View style={styles.policyFooter}>
                  <Text style={styles.policyFooterText}>
                    By using MyGlassCase, you agree to our{' '}
                    <Text style={styles.link} onPress={() => openURL(POLICY_CONFIG.termsUrl)}>
                      Terms and Conditions
                    </Text>
                    {' '}and{' '}
                    <Text style={styles.link} onPress={() => openURL(POLICY_CONFIG.privacyUrl)}>
                      Privacy Policy
                    </Text>
                  </Text>
                </View>
              </>
            )}

            {mode === 'signup' && (
              <View style={styles.footerLink}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => onModeChange('signin')}>
                  <Text style={styles.linkButton}>Sign in</Text>
                </TouchableOpacity>
              </View>
            )}

            {mode === 'reset' && (
              <View style={styles.footerLink}>
                <Text style={styles.footerText}>Remember your password? </Text>
                <TouchableOpacity onPress={() => onModeChange('signin')}>
                  <Text style={styles.linkButton}>Sign in</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#111827' : '#F0FDF4',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  formContainer: {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: isDark ? '#FFFFFF' : '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: isDark ? '#D1D5DB' : '#6B7280',
    textAlign: 'center',
  },
  policyContainer: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: isDark ? '#4B5563' : '#D1D5DB',
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  policyText: {
    flex: 1,
    fontSize: 13,
    color: isDark ? '#D1D5DB' : '#374151',
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#D1D5DB' : '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 48,
    paddingLeft: 44,
    paddingRight: 16,
    backgroundColor: isDark ? '#374151' : '#FFFFFF',
    borderWidth: 1,
    borderColor: isDark ? '#4B5563' : '#D1D5DB',
    borderRadius: 8,
    fontSize: 16,
    color: isDark ? '#FFFFFF' : '#111827',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successMessage: {
    backgroundColor: isDark ? '#064E3B20' : '#DCFCE7',
  },
  errorMessage: {
    backgroundColor: isDark ? '#7F1D1D20' : '#FEE2E2',
  },
  messageText: {
    fontSize: 13,
  },
  successText: {
    color: isDark ? '#34D399' : '#166534',
  },
  errorContainer: {
    padding: 12,
    backgroundColor: isDark ? '#7F1D1D20' : '#FEE2E2',
    borderWidth: 1,
    borderColor: isDark ? '#991B1B' : '#FCA5A5',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: isDark ? '#FCA5A5' : '#991B1B',
    fontSize: 13,
  },
  button: {
    backgroundColor: '#16A34A',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#86EFAC',
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: isDark ? '#9CA3AF' : '#6B7280',
  },
  linkButton: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: '600',
  },
  link: {
    color: '#16A34A',
    textDecorationLine: 'underline',
  },
  secondaryButton: {
    backgroundColor: '#16A34A',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    width: '100%',
  },
  policyFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: isDark ? '#374151' : '#E5E7EB',
  },
  policyFooterText: {
    fontSize: 11,
    color: isDark ? '#9CA3AF' : '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});
