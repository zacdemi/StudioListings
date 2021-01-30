import React, { useState, useEffect } from 'react';
import { Text, TextInput, View } from 'react-native';
import { tw, color } from 'react-native-tailwindcss';
import AsyncStorage from '@react-native-community/async-storage';
import { useLazyQuery, useMutation } from '@apollo/react-hooks';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import RNPickerSelect from 'react-native-picker-select';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import { ScreenView, Button, SkipButton } from 'components';
import { updateMyStudio as updateMyStudioRedux } from 'state/actions';
import { UPDATE_MY_STUDIO, UPDATE_MY_STUDIO_USER } from 'api';
import { useMyStudio } from 'utils';

const StudioRatesScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const [updateMyStudio] = useMutation(UPDATE_MY_STUDIO);
  const [updateMyStudioUser] = useMutation(UPDATE_MY_STUDIO_USER);

  const studio = useMyStudio();

  const { id, hourlyRate, studioUsers } = studio;

  const hasExistingEngineer =
    studioUsers && studioUsers.length && !!studioUsers[0].hourlyRate;

  const { control, handleSubmit, errors, watch } = useForm();
  const watchEngineerServices = watch('engineerServices', false);
  const editMode = route.params && route.params.edit;

  const onSubmit = async ({ studioRate, engineerRate }) => {
    try {
      const {
        data: { updateMyStudio: updateMyStudioResponse },
      } = await updateMyStudio({
        variables: {
          id,
          hourlyRate: Number(studioRate),
        },
      });
      const { hourlyRate } = updateMyStudioResponse;
      console.log('hourly Rate from studio respnse', hourlyRate);

      dispatch(updateMyStudioRedux(id, { hourlyRate }));

      if (engineerRate) {
        const {
          data: { updateMyStudioUser: updateMyStudioUserResponse },
        } = await updateMyStudioUser({
          variables: {
            studioId: id,
            hourlyRate: Number(engineerRate),
            id: studioUsers[0].id,
          },
        });
        dispatch(
          updateMyStudioRedux(id, {
            studioUsers: [
              {
                hourlyRate: updateMyStudioUserResponse.hourlyRate,
                id: updateMyStudioUserResponse.id,
              },
            ],
          }),
        );
      }

      console.log('edit mode', editMode);
      if (editMode) {
        navigation.navigate('My Studio Details');
        navigation.popToTop();
      } else {
        navigation.navigate('Studio Hours');
      }
    } catch (err) {
      console.log('errrr', err);
    }
  };

  return (
    <ScreenView style={[tw.flex1]} dismissKeyboard>
      <SkipButton
        onPress={() => navigation.navigate('Onboarding Congrats')}
        style={[tw.mR2, tw.mT2, tw.absolute, tw.top0, tw.right0]}
        hide={editMode}
      />
      <View style={[tw.mB8]}>
        <Text style={[tw.mT2, tw.mB3, tw.text2xl, tw.fontBold, tw.textLeft]}>
          What is your studio rate per hour?
        </Text>
        <Controller
          control={control}
          render={({ onChange, onBlur, value }) => (
            <TextInput
              autoCorrect={false}
              style={[tw.h10, tw.borderBlack, tw.border2, tw.padding, tw.pX2]}
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={value => onChange(value)}
              placeholder="Rate Per Hour"
              placeholderTextColor="grey"
              value={value}
            />
          )}
          name="studioRate"
          rules={{
            required: 'Studio Rate Required',
          }}
          defaultValue={hourlyRate}
        />
        {errors.studioRate && (
          <Text style={[tw.textRed600, tw.mT1]}>
            {errors.studioRate.message}
          </Text>
        )}
      </View>
      <View style={[tw.mB8]}>
        <Text style={[tw.mB3, tw.text2xl, tw.fontBold, tw.textLeft]}>
          Does your studio offer engineering services?
        </Text>
        <Controller
          control={control}
          render={({ onChange, onBlur, value }) => (
            <RNPickerSelect
              style={{
                inputIOS: {
                  marginTop: 6,
                  paddingVertical: 8,
                  paddingHorizontal: 8,
                  borderWidth: 2,
                  borderColor: color.black,
                  borderRadius: 2,
                  color: 'black',
                  paddingRight: 30, // to ensure the text is never behind the icon
                },
                inputAndroid: {
                  fontSize: 16,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderWidth: 0.5,
                  borderColor: 'purple',
                  color: 'black',
                  paddingRight: 30, // to ensure the text is never behind the icon
                },
              }}
              value={value}
              onValueChange={value => onChange(value)}
              items={[
                { label: 'N/A', value: false },
                { label: 'Yes', value: true },
                { label: 'No', value: false },
              ]}
              Icon={() => (
                <MaterialIcon
                  name="arrow-drop-down"
                  size={30}
                  color={color.gray600}
                  style={{ right: 8, top: 8 }}
                />
              )}
            />
          )}
          name="engineerServices"
          rules={{
            required: false,
          }}
          defaultValue={hasExistingEngineer}
        />
      </View>
      {watchEngineerServices === true || hasExistingEngineer ? ( // had to use === true here.
        <View style={[tw.mB8]}>
          <Text style={[tw.mB3, tw.text2xl, tw.fontBold, tw.textLeft]}>
            What is your engineering rate per hour?
          </Text>
          <Controller
            control={control}
            render={({ onChange, onBlur, value }) => (
              <TextInput
                autoCorrect={false}
                style={[tw.h10, tw.borderBlack, tw.border2, tw.padding, tw.pX2]}
                keyboardType="numeric"
                onBlur={onBlur}
                onChangeText={value => onChange(value)}
                placeholder="Rate Per Hour"
                placeholderTextColor="grey"
                value={value}
              />
            )}
            name="engineerRate"
            rules={{
              required: 'Engineering Rate Required',
            }}
            defaultValue={studioUsers[0].hourlyRate}
          />
          {errors.engineerRate && (
            <Text style={[tw.textRed600, tw.mT1]}>
              {errors.engineerRate.message}
            </Text>
          )}
        </View>
      ) : null}
      <Button
        style={[tw.wFull, tw.roundedSm, tw.pY3, tw.bgBlack, tw.mTAuto]}
        onPress={handleSubmit(onSubmit)}
        title={editMode ? 'Done' : 'Continue'}
      />
    </ScreenView>
  );
};
export default StudioRatesScreen;
