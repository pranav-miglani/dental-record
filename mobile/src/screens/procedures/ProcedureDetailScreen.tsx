import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

const ProcedureDetailScreen = (): JSX.Element => {
  const {t} = useTranslation();
  // TODO: Fetch procedure details from API using route params

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium">
          {t('procedures.title')} Details
        </Text>
        {/* Procedure details will be rendered here */}
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
});

export default ProcedureDetailScreen;

