import React, {useState} from 'react';
import {View, StyleSheet, KeyboardAvoidingView, Platform} from 'react-native';
import {TextInput, Button, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {authService} from '../../services/authService';
import {AuthStackParamList} from '../../navigation/AuthNavigator';

type PasswordResetScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'PasswordReset'
>;

const PasswordResetScreen = (): JSX.Element => {
  const {t} = useTranslation();
  const navigation = useNavigation<PasswordResetScreenNavigationProp>();
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOTP = async () => {
    if (!mobileNumber) {
      return;
    }

    try {
      setIsLoading(true);
      await authService.requestPasswordReset(mobileNumber);
      navigation.navigate('OTPVerification', {mobileNumber});
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
          {t('auth.passwordReset.title')}
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {t('auth.passwordReset.subtitle')}
        </Text>

        <TextInput
          label={t('auth.passwordReset.mobileNumber')}
          value={mobileNumber}
          onChangeText={setMobileNumber}
          keyboardType="phone-pad"
          mode="outlined"
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleRequestOTP}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}>
          {t('auth.passwordReset.button')}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
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
});

export default PasswordResetScreen;

