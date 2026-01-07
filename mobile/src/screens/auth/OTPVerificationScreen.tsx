import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {TextInput, Button, Text} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {authService} from '../../services/authService';
import {AuthStackParamList} from '../../navigation/AuthNavigator';

type OTPVerificationScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'OTPVerification'
>;

const OTPVerificationScreen = (): JSX.Element => {
  const {t} = useTranslation();
  const navigation = useNavigation<OTPVerificationScreenNavigationProp>();
  const route = useRoute();
  const {mobileNumber} = route.params as {mobileNumber: string};

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!otp || !newPassword || newPassword !== confirmPassword) {
      return;
    }

    try {
      setIsLoading(true);
      await authService.verifyOTPAndResetPassword({
        mobileNumber,
        otp,
        newPassword,
      });
      navigation.navigate('Login');
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
          {t('auth.otpVerification.title')}
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {t('auth.otpVerification.subtitle')}
        </Text>

        <TextInput
          label={t('auth.otpVerification.otp')}
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label={t('auth.otpVerification.newPassword')}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label={t('auth.otpVerification.confirmPassword')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleResetPassword}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}>
          {t('auth.otpVerification.button')}
        </Button>
      </View>
    </View>
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

export default OTPVerificationScreen;

