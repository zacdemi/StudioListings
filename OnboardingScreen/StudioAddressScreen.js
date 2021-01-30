import React, { useState, useEffect, useRef } from 'react';
import { tw, color } from 'react-native-tailwindcss';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenView, Input, InputContainer, Button } from 'components';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { googlePlaces } from 'env';

const StudioAddressScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const placesRef = useRef();

  useEffect(() => {
    //hack
    setTimeout(() => {
      placesRef.current.focus();
    }, 100);
  }, []);

  return (
    <ScreenView style={[tw.flex1, tw.pL10, tw.mT3]} dismissKeyboard={true}>
      <GooglePlacesAutocomplete
        placeholder="Address"
        minLength={3}
        fetchDetails
        ref={placesRef}
        onPress={(data, details = null) => {
          // 'details' is provided when fetchDetails = true
          route.params.onReturn(details);
          navigation.goBack();
        }}
        query={{
          key: googlePlaces,
          language: 'en',
          components: 'country:us',
        }}
        styles={{
          textInputContainer: {},
          textInput: {
            height: 40,
            fontSize: 16,
            borderColor: color.black,
            borderWidth: 1.5,
          },
        }}
      />
    </ScreenView>
  );
};
export default StudioAddressScreen;
