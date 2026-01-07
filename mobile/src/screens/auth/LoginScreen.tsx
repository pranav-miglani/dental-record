import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {TextInput, Button, Text, Snackbar} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {useAuthStore} from '../../store/authStore';
import {AuthStackParamList} from '../../navigation/AuthNavigator';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

const LoginScreen = (): JSX.Element => {
  const {t} = useTranslation();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const {login, error, clearError} = useAuthStore();

  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleLogin = async () => {
    if (!mobileNumber || !password) {
      setShowError(true);
      return;
    }

    try {
      setIsLoading(true);
      await login({mobileNumber, password});
      // Navigation will be handled by AppNavigator based on auth state
    } catch (err) {
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text variant="headlineLarge" style={styles.title}>
            {t('auth.login.title')}
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {t('auth.login.subtitle')}
          </Text>

          <TextInput
            label={t('auth.login.mobileNumber')}
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
          />

          <TextInput
            label={t('auth.login.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}>
            {t('auth.login.button')}
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('PasswordReset')}
            style={styles.forgotButton}>
            {t('auth.login.forgotPassword')}
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={showError}
        onDismiss={() => {
          setShowError(false);
          clearError();
        }}
        duration={3000}>
        {error || t('auth.login.error')}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  forgotButton: {
    marginTop: 16,
  },
});

export default LoginScreen;

