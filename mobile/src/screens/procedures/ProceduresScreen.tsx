import React from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {Text, Card} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';

const ProceduresScreen = (): JSX.Element => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [procedures, setProcedures] = React.useState([]);

  // TODO: Fetch procedures from API

  return (
    <View style={styles.container}>
      <FlatList
        data={procedures}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <Card
            style={styles.card}
            onPress={() => navigation.navigate('ProcedureDetail' as never, {procedureId: item.id} as never)}>
            <Card.Content>
              <Text variant="titleMedium">{item.type}</Text>
              <Text variant="bodyMedium" style={styles.status}>
                {t(`procedures.status.${item.status.toLowerCase()}`)}
              </Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">{t('procedures.noProcedures')}</Text>
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
  card: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  status: {
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

export default ProceduresScreen;

