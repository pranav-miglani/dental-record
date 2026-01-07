import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import PasswordResetScreen from '../screens/auth/PasswordResetScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';

export type AuthStackParamList = {
  Login: undefined;
  PasswordReset: undefined;
  OTPVerification: {
    mobileNumber: string;
  };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = (): JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="PasswordReset" component={PasswordResetScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;

