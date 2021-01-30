import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { tw } from 'react-native-tailwindcss';
import AsyncStorage from '@react-native-community/async-storage';
import { useLazyQuery, useMutation } from '@apollo/react-hooks';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { setJwt } from 'state/actions';
import { ScreenView, Input, InputContainer, Button } from 'components';
import { CREATE_USER } from 'api';
import { useForm, Controller } from 'react-hook-form';

// import {
//   GoogleSignin,
//   GoogleSigninButton,
//   statusCodes,
// } from '@react-native-community/google-signin';

const SignUp = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  // const [email, setEmail] = useState();
  // const [password, setPassword] = useState();
  const [createUser, { loading, data }] = useMutation(CREATE_USER);

  const { control, handleSubmit, errors } = useForm();
  const onSubmit = data => {
    console.log('data', data);
    navigation.navigate('Create Profile');
    //signUp(data);
  };

  console.log();

  // const signIn = async () => {
  //   try {
  //     await GoogleSignin.hasPlayServices();
  //     const userInfo = await GoogleSignin.signIn();
  //     // this.setState({ userInfo });
  //   } catch (error) {
  //     if (error.code === statusCodes.SIGN_IN_CANCELLED) {
  //       // user cancelled the login flow
  //     } else if (error.code === statusCodes.IN_PROGRESS) {
  //       // operation (e.g. sign in) is in progress already
  //     } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
  //       // play services not available or outdated
  //     } else {
  //       // some other error happened
  //     }
  //   }
  // }

  // useEffect(() => {
  //   signIn();
  // }, [])

  const signUp = async ({ email, password }) => {
    const lowerEmail = email.toLowerCase();
    try {
      const {
        data: {
          createUser: { success, message, jwt },
        },
      } = await createUser({
        variables: {
          email: lowerEmail,
          password,
        },
      });
      if (success) {
        await AsyncStorage.setItem('jwt', jwt);
        dispatch(setJwt(jwt));
        navigation.navigate('Profile');
      }
    } catch (err) {
      console.log('err', err);
    }
  };

  return (
    <ScreenView style={[tw.flex1, tw.justifyCenter]}>
      <View style={[tw.justifyCenter, tw.h16, tw.mB8]}>
        <Text style={[tw.text2xl, tw.fontBold, tw.textCenter]}>
          Create an account to post your studio
        </Text>
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
        style={[tw.wFull, tw.roundedSm, tw.pY3, tw.bgBlack]}
        onPress={handleSubmit(signUp)}
        title="Submit"
      />
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('Login');
        }}
        style={[tw.flexRow, tw.justifyCenter, tw.itemsCenter, tw.mT10]}>
        <Text>Aleady have an account? </Text>
        <Text style={[tw.underline]}>Log In Here</Text>
      </TouchableOpacity>
    </ScreenView>
  );
};
export default SignUp;
