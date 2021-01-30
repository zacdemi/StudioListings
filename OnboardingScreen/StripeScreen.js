import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import AsyncStorage from '@react-native-community/async-storage';
import { useLazyQuery, useMutation, useQuery, useApolloClient } from '@apollo/react-hooks';
import { useDispatch } from 'react-redux';

import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { updateUser as reduxUpdateUser } from 'state/actions';


import { GET_STRIPE_LINK, GET_MY_STRIPE_STATUS } from 'api';

const SignUp = () => {
  const { loading, error, data } = useQuery(GET_STRIPE_LINK);
  const navigation = useNavigation();
  const client = useApolloClient();
  const dispatch = useDispatch();
  if (loading) return null;

  const onWebViewStateChange = async navState => {
    if (navState.url.includes('plugmusic')) {
      navigation.navigate('Listings');
      const {
        data: {
          myUser: { stripeStatus },
        },
      } = await client.query({
        query: GET_MY_STRIPE_STATUS,
      });
      dispatch(
        reduxUpdateUser({
          stripeStatus
        }),
      );
    }
  };

  return (
    <WebView
      source={{ uri: data.stripeLink.url }}
      startInLoadingState
      scalesPageToFit
      javaScriptEnabled
      bounces={false}
      onNavigationStateChange={navState => onWebViewStateChange(navState)}
      javaScriptEnabledAndroid
    />
  );
};
export default SignUp;
