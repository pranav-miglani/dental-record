import React from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {Text, Card, Searchbar} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';

const PatientsScreen = (): JSX.Element => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [patients, setPatients] = React.useState([]);

  // TODO: Fetch patients from API

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={t('patients.searchPlaceholder')}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <FlatList
        data={patients}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <Card
            style={styles.card}
            onPress={() => navigation.navigate('PatientDetail' as never, {patientId: item.id} as never)}>
            <Card.Content>
              <Text variant="titleMedium">{item.name}</Text>
              <Text variant="bodyMedium" style={styles.mobile}>
                {item.mobileNumber}
              </Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">{t('patients.noPatients')}</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchbar: {
    margin: 16,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  mobile: {
    marginTop: 4,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});

export default PatientsScreen;

