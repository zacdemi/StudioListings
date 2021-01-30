import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { tw } from 'react-native-tailwindcss';
import AsyncStorage from '@react-native-community/async-storage';
import { useLazyQuery, useMutation } from '@apollo/react-hooks';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { updateMyStudio as updateMyStudioRedux } from 'state/actions';
import { ScreenView, Button, SkipButton } from 'components';
import { UPDATE_MY_STUDIO } from 'api';

const StudioDescriptionScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const [updateMyStudio] = useMutation(UPDATE_MY_STUDIO);
  const { name, description, id } = useSelector(
    state => state.myStudios.studios[state.myStudios.currentStudioId],
  );

  const { control, handleSubmit, errors } = useForm();

  const editMode = route.params && route.params.edit;

  const onSubmit = async ({ name, description }) => {
    try {
      const {
        data: { updateMyStudio: updateMyStudioResponse },
      } = await updateMyStudio({
        variables: {
          id,
          name,
          description,
        },
      });

      dispatch(updateMyStudioRedux(id, { ...updateMyStudioResponse }));
      if (editMode) {
        navigation.navigate('My Studio Details');
        navigation.popToTop();
      } else {
        navigation.navigate('Studio Location');
      }
    } catch (err) {
      console.log('errrr', err);
    }
  };

  return (
    <ScreenView style={[tw.flex1]} dismissKeyboard>
      <SkipButton
        onPress={() => navigation.navigate('Studio Location')}
        style={[tw.mR2, tw.mT2, tw.absolute, tw.top0, tw.right0]}
        hide={editMode}
      />
      <Text style={[tw.mT2, tw.mB8, tw.text2xl, tw.fontBold, tw.textCenter]}>
        {editMode ? 'Edit studio' : 'Tell us about your studio'}
      </Text>
      <View style={[tw.mB3]}>
        <Controller
          control={control}
          render={({ onChange, onBlur, value }) => (
            <TextInput
              autoCorrect={false}
              style={[tw.h10, tw.borderBlack, tw.border2, tw.padding, tw.pX2]}
              onBlur={onBlur}
              onChangeText={value => onChange(value)}
              placeholder="Name of studio"
              placeholderTextColor="grey"
              value={value}
            />
          )}
          name="name"
          rules={{
            required: 'Studio name required',
          }}
          defaultValue={name}
        />
        {errors.name && (
          <Text style={[tw.textRed600, tw.mT1]}>{errors.name.message}</Text>
        )}
      </View>
      <View style={[tw.mB3]}>
        <Controller
          control={control}
          render={({ onChange, onBlur, value }) => (
            <TextInput
              autoCorrect={false}
              style={[tw.h32, tw.borderBlack, tw.border2, tw.padding, tw.pX2]}
              multiline
              maxLength={300}
              onBlur={onBlur}
              onChangeText={value => onChange(value)}
              placeholder="Description"
              placeholderTextColor="grey"
              value={value}
            />
          )}
          name="description"
          rules={{
            required: 'Description required',
          }}
          defaultValue={description}
        />
        {errors.description && (
          <Text style={[tw.textRed600, tw.mT1]}>
            {errors.description.message}
          </Text>
        )}
      </View>
      <Button
        style={[tw.wFull, tw.roundedSm, tw.pY3, tw.bgBlack, tw.mTAuto]}
        onPress={handleSubmit(onSubmit)}
        title={editMode ? 'Done' : 'Continue'}
      />
    </ScreenView>
  );
};
export default StudioDescriptionScreen;
