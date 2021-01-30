import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, TouchableOpacity } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import AsyncStorage from '@react-native-community/async-storage';
import { useLazyQuery, useApolloClient } from '@apollo/react-hooks';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { setJwt, updateUser } from 'state/actions';
import { ScreenView, Button } from 'components';
import { LOGIN_USER, GET_MY_USER } from 'api';
import { useForm, Controller } from 'react-hook-form';
import { FieldsOnCorrectTypeRule } from 'graphql';

const LoginScreen = () => {
  const dispatch = useDispatch();
  const client = useApolloClient();
  const navigation = useNavigation();
  const [loginError, setLoginError] = useState(false);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, errors } = useForm();

  const login = async ({ email, password }) => {
    try {
      const {
        data: {
          loginUser: { success, message, jwt },
        },
      } = await client.query({
        query: LOGIN_USER,
        variables: { email: email.toLowerCase(), password },
      });
      await AsyncStorage.setItem('jwt', jwt);
      if (success) {
        setLoading(true);
        try {
          const {
            data: {
              myUser: { firstName, lastName, phoneNumber },
            },
          } = await client.query({
            query: GET_MY_USER,
          });
          dispatch(
            updateUser({
              firstName,
              lastName,
              phoneNumber,
            }),
          );
          dispatch(setJwt(jwt));
          setLoading(false);

          if (!firstName) {
            navigation.navigate('Profile');
          } else {
            navigation.navigate('Listings');
          }
        } catch (err) {
          console.log('updateUser error', err);
        }
      }
    } catch (err) {
      console.log('err', err);
      setLoginError(true);
    }
  };

  return (
    <ScreenView style={[tw.flex1, tw.justifyCenter]}>
      <View style={[tw.justifyCenter, tw.h16, tw.mB8]}>
        <Text style={[tw.text2xl, tw.fontBold, tw.textCenter]}>Login</Text>
      </View>
      <View style={[tw.mB3]}>
        <Controller
          control={control}
          render={({ onChange, onBlur, value }) => (
            <TextInput
              style={[tw.h10, tw.borderBlack, tw.border2, tw.padding, tw.pX2]}
              onBlur={onBlur}
              onChangeText={value => onChange(value)}
              placeholder="jane@example.com"
              placeholderTextColor="grey"
              value={value}
            />
          )}
          name="email"
          rules={{
            required: 'Email required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Must be a valid email.',
            },
          }}
          defaultValue=""
        />
        {errors.email && (
          <Text style={[tw.textRed600, tw.mT1]}>{errors.email.message}</Text>
        )}
      </View>
      <View style={[tw.mB3]}>
        <Controller
          control={control}
          render={({ onChange, onBlur, value }) => (
            <TextInput
              style={[tw.h10, tw.borderBlack, tw.border2, tw.padding, tw.pX2]}
              onBlur={onBlur}
              onChangeText={value => onChange(value)}
              placeholder="Password"
              placeholderTextColor="grey"
              value={value}
              secureTextEntry={true}
            />
          )}
          name="password"
          rules={{
            required: 'Password required',
          }}
          defaultValue=""
        />
        {errors.password && (
          <Text style={[tw.textRed600, tw.mT1]}>{errors.password.message}</Text>
        )}
      </View>
      <Button
        loading={loading}
        style={[tw.wFull, tw.roundedSm, tw.pY3, tw.bgBlack]}
        onPress={handleSubmit(login)}
        title="Submit"
      />
      {loginError && (
        <View style={[tw.itemsCenter]}>
          <Text style={[tw.textRed600, tw.mT1]}>
            incorrect email or password
          </Text>
        </View>
      )}

      <TouchableOpacity style={[tw.itemsCenter, tw.mT10]}>
        <Text style={[tw.underline]}>Forgot your password?</Text>
      </TouchableOpacity>
    </ScreenView>
  );
};
export default LoginScreen;
