import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, Card, Button} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useAuthStore} from '../store/authStore';
import {useNavigation} from '@react-navigation/native';

const ProfileScreen = (): JSX.Element => {
  const {t} = useTranslation();
  const {user, logout} = useAuthStore();
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          {t('profile.title')}
        </Text>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">{t('profile.name')}</Text>
            <Text variant="bodyLarge" style={styles.value}>
              {user?.name || 'N/A'}
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">{t('profile.mobileNumber')}</Text>
            <Text variant="bodyLarge" style={styles.value}>
              {user?.mobileNumber}
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">{t('profile.roles')}</Text>
            <Text variant="bodyLarge" style={styles.value}>
              {user?.roles.join(', ')}
            </Text>
          </Card.Content>
        </Card>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="#B00020">
          {t('profile.logout')}
        </Button>
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
  value: {
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 24,
    paddingVertical: 4,
  },
});

export default ProfileScreen;

