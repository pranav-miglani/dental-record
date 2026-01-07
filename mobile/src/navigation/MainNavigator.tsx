import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTranslation} from 'react-i18next';
import {useAuthStore} from '../store/authStore';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import PatientsScreen from '../screens/patients/PatientsScreen';
import PatientDetailScreen from '../screens/patients/PatientDetailScreen';
import ProceduresScreen from '../screens/procedures/ProceduresScreen';
import ProcedureDetailScreen from '../screens/procedures/ProcedureDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const PatientsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PatientsList"
        component={PatientsScreen}
        options={{title: 'Patients'}}
      />
      <Stack.Screen
        name="PatientDetail"
        component={PatientDetailScreen}
        options={{title: 'Patient Details'}}
      />
    </Stack.Navigator>
  );
};

const ProceduresStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProceduresList"
        component={ProceduresScreen}
        options={{title: 'Procedures'}}
      />
      <Stack.Screen
        name="ProcedureDetail"
        component={ProcedureDetailScreen}
        options={{title: 'Procedure Details'}}
      />
    </Stack.Navigator>
  );
};

const MainNavigator = (): JSX.Element => {
  const {t} = useTranslation();
  const {user} = useAuthStore();
  const isPatient = user?.roles.includes('PATIENT');

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'Patients') {
            iconName = focused ? 'account-group' : 'account-group-outline';
          } else if (route.name === 'Procedures') {
            iconName = focused ? 'tooth' : 'tooth-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          } else {
            iconName = 'help-circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{title: t('navigation.dashboard')}}
      />
      {!isPatient && (
        <Tab.Screen
          name="Patients"
          component={PatientsStack}
          options={{title: t('navigation.patients')}}
        />
      )}
      <Tab.Screen
        name="Procedures"
        component={ProceduresStack}
        options={{title: t('navigation.procedures')}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{title: t('navigation.profile')}}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;

