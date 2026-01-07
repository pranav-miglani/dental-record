import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

const LoadingScreen = (): JSX.Element => {
  const {t} = useTranslation();

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={styles.text}>{t('common.loading')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default LoadingScreen;

