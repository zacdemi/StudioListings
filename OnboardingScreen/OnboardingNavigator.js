import React, { useEffect } from 'react';
import {
  createStackNavigator,
  HeaderBackButton,
  StackActions,
} from '@react-navigation/stack';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { tw, color } from 'react-native-tailwindcss';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import StudioDescriptionScreen from './StudioDescriptionScreen';
import StudioLocationScreen from './StudioLocationScreen';
import StudioAddressScreen from './StudioAddressScreen';
import StudioImagesScreen from './StudioImagesScreen';
import StudioEquipmentScreen from './StudioEquipmentScreen';
import StudioRatesScreen from './StudioRatesScreen';
import StudioHoursScreen from './StudioHoursScreen';
import StudioEditHoursScreen from './StudioEditHoursScreen';
import OnboardingCongratsScreen from './OnboardingCongratsScreen';
import StripeScreen from './StripeScreen';

const Stack = createStackNavigator();

function ExploreNavigator({ navigation: parentNavigation }) {
  const navigation = useNavigation();

  return (
    <Stack.Navigator
      headerMode="screen"
      initialRouteName="Studio Description"
      screenOptions={{
        cardStyle: {
          backgroundColor: 'white',
        },
      }}>
      <Stack.Screen
        name="Studio Description"
        component={StudioDescriptionScreen}
        options={{ title: 'Your Studio', headerLeft: null }}
      />
      <Stack.Screen
        name="Studio Location"
        component={StudioLocationScreen}
        options={{ title: 'Studio Location' }}
      />
      <Stack.Screen
        name="Studio Address"
        component={StudioAddressScreen}
        options={{
          headerTransparent: true,
          title: '',
          headerBackTitleVisible: false,
          headerBackImage: props => (
            <EntypoIcon
              {...props}
              name="chevron-left"
              size={28}
              color="black"
              style={[tw.pL3]}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Studio Images"
        component={StudioImagesScreen}
        options={{ title: 'Studio Images' }}
      />
      <Stack.Screen
        name="Studio Equipment"
        component={StudioEquipmentScreen}
        options={{ title: 'Studio Equipment' }}
      />
      <Stack.Screen
        name="Studio Rates"
        component={StudioRatesScreen}
        options={{ title: 'Booking Info' }}
      />
      <Stack.Screen
        name="Studio Hours"
        component={StudioHoursScreen}
        options={{ title: 'Hours of operation' }}
      />
      <Stack.Screen
        name="Studio Edit Hours"
        component={StudioEditHoursScreen}
        options={{ title: 'Edit Studio Hours', headerLeft: null }}
      />
      <Stack.Screen
        name="Onboarding Congrats"
        component={OnboardingCongratsScreen}
        options={{ title: 'Congrats' }}
      />
      <Stack.Screen
        name="Stripe"
        component={StripeScreen}
        options={{ headerLeft: null, swipeEnabled: false }}
      />
    </Stack.Navigator>
  );
}

export default ExploreNavigator;
