import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, Card} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useAuthStore} from '../store/authStore';

const DashboardScreen = (): JSX.Element => {
  const {t} = useTranslation();
  const {user} = useAuthStore();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          {t('navigation.dashboard')}
        </Text>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Welcome, {user?.name || user?.mobileNumber}</Text>
            <Text variant="bodyMedium" style={styles.roleText}>
              Role: {user?.roles.join(', ')}
            </Text>
          </Card.Content>
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
  roleText: {
    marginTop: 8,
    color: '#666',
  },
});

export default DashboardScreen;

