import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, Card} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

const PatientDetailScreen = (): JSX.Element => {
  const {t} = useTranslation();
  // TODO: Fetch patient details from API using route params

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          {t('patients.details.title')}
        </Text>
        {/* Patient details will be rendered here */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
});

export default PatientDetailScreen;

