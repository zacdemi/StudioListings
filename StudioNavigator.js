import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import ListingsScreen from './ListingsScreen';
import SignUpScreen from './SignUpScreen';
import LoginScreen from './LoginScreen';
import ProfileScreen from './ProfileScreen';
import OnboardingScreen from './OnboardingScreen';

const Stack = createStackNavigator();

function ExploreNavigator() {
  const jwt = useSelector(state => state.session.jwt);
  const { firstName } = useSelector(state => state.user);

  return (
    <Stack.Navigator
      headerMode="screen"
      initialRouteName={firstName ? 'Listings' : 'Profile'}
      screenOptions={{
        cardStyle: {
          backgroundColor: 'white',
        },
      }}>
      {jwt ? (
        <>
          <Stack.Screen
            name="Listings"
            component={ListingsScreen}
            options={{ title: 'My Studios', headerLeft: null }}
          />

          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'My Profile', headerleft: null }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Sign Up"
            component={SignUpScreen}
            options={{ title: 'Sign Up' }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Login' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default ExploreNavigator;
