import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, Card, List} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

const SettingsScreen = (): JSX.Element => {
  const {t, i18n} = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          {t('settings.title')}
        </Text>
        <Card style={styles.card}>
          <List.Item
            title={t('settings.language')}
            description="English"
            left={props => <List.Icon {...props} icon="translate" />}
            onPress={() => {
              // Show language picker
            }}
          />
        </Card>
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
  card: {
    marginBottom: 16,
  },
});

export default SettingsScreen;

