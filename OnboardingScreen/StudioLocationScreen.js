import React, { useState, useEffect, useRef } from 'react';
import { Text, View, TextInput } from 'react-native';
import { tw, color } from 'react-native-tailwindcss';
import AsyncStorage from '@react-native-community/async-storage';
import { useLazyQuery, useMutation } from '@apollo/react-hooks';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { ScreenView, Button, SkipButton } from 'components';
import { UPDATE_MY_STUDIO } from 'api';
import { updateMyStudio as updateMyStudioRedux } from 'state/actions';

const StudioLocationScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { control, handleSubmit, errors, setValue, clearErrors } = useForm();
  const [updateMyStudio] = useMutation(UPDATE_MY_STUDIO);
  const [addressDetails, setAddressDetails] = useState();

  const { street2, id } = useSelector(
    state => state.myStudios.studios[state.myStudios.currentStudioId],
  );

  const editMode = route.params && route.params.edit;

  const onSubmit = async ({ street2 }) => {
    const address = parseAddress(addressDetails);

    try {
      const {
        data: { updateMyStudio: updateMyStudioResponse },
      } = await updateMyStudio({
        variables: {
          id,
          street1: 'test street1', //address.street1,
          street2: 'test street2', //street2,
          city: address.city,
          state: address.state,
          zipcode: address.zipcode,
          // lat: address.lat,
          // lng: address.lng,
        },
      });
      dispatch(updateMyStudioRedux(id, { ...updateMyStudioResponse }));
    } catch (err) {
      console.log('error', err);
    }
    if (editMode) {
      navigation.navigate('My Studio Details');
      navigation.popToTop();
    } else {
      navigation.navigate('Studio Images');
    }
  };

  const parseAddress = details => {
    const address = {};

    const nameMap = {
      street_number: 'street_number',
      route: 'street1',
      locality: 'city',
      administrative_area_level_1: 'state',
      country: 'country',
      postal_code: 'zipcode',
    };

    details.address_components.forEach(item => {
      const name = nameMap[item.types[0]];
      name && (address[name] = item.long_name);
    });

    address['lat'] = details.geometry.location.lat;
    address['lon'] = details.geometry.location.lng;

    return address;
  };

  return (
    <ScreenView style={[tw.flex1]} dismissKeyboard>
      <SkipButton
        onPress={() => navigation.navigate('Studio Images')}
        style={[tw.mR2, tw.mT2, tw.absolute, tw.top0, tw.right0]}
        hide={editMode}
      />
      <Text style={[tw.mT2, tw.mB8, tw.text2xl, tw.fontBold, tw.textCenter]}>
        Where is your studio located?
      </Text>
      <View style={[tw.mB3]}>
        <Controller
          control={control}
          render={({ onChange, onBlur, value }) => (
            <TextInput
              autoCorrect={false}
              style={[tw.h10, tw.borderBlack, tw.border2, tw.padding, tw.pX2]}
              onBlur={onBlur}
              onFocus={() => {
                navigation.navigate('Studio Address', {
                  onReturn: addressDetails => {
                    setAddressDetails(addressDetails);
                    setValue('address', addressDetails.formatted_address);
                    clearErrors('address');
                  },
                });
              }}
              onChangeText={value => onChange(value)}
              placeholder="Address"
              placeholderTextColor="grey"
              value={value}
            />
          )}
          name="address"
          rules={{
            required: 'Address required',
          }}
          defaultValue=""
        />
        {errors.address && (
          <Text style={[tw.textRed600, tw.mT1]}>{errors.address.message}</Text>
        )}
      </View>
      <View style={[tw.mB3]}>
        <Controller
          control={control}
          render={({ onChange, onBlur, value }) => (
            <TextInput
              autoCorrect={false}
              style={[tw.h10, tw.borderBlack, tw.border2, tw.padding, tw.pX2]}
              onBlur={onBlur}
              onChangeText={value => onChange(value)}
              placeholder="Apt., Building, Floor (Optional)"
              placeholderTextColor="grey"
              value={value}
            />
          )}
          name="street2"
          defaultValue={street2}
        />
      </View>
      <Button
        style={[tw.wFull, tw.roundedSm, tw.pY3, tw.bgBlack, tw.mTAuto]}
        onPress={handleSubmit(onSubmit)}
        title={editMode ? 'Done' : 'Continue'}
      />
    </ScreenView>
  );
};
export default StudioLocationScreen;
