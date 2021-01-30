import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { tw, color } from 'react-native-tailwindcss';
import { useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenView, StudioHours, Button } from 'components';
import { useMyStudio } from '../../../../../utils/hooks';

const StudioHoursScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const studio = useMyStudio();

  return (
    <ScreenView style={[tw.flex1]} dismissKeyboard>
      <Text style={[tw.mB8, tw.text2xl, tw.fontBold, tw.textCenter]}>
        When is your studio open?
      </Text>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('Studio Edit Hours');
        }}
        style={[tw.flexRow, tw.justifyEnd]}>
        <Text style={[tw.textLg]}>Edit</Text>
      </TouchableOpacity>
      <StudioHours
        data={studio.realHoursOfOperation ? studio.realHoursOfOperation : []}
      />
      <Button
        style={[tw.wFull, tw.roundedSm, tw.pY3, tw.bgBlack, tw.mTAuto]}
        onPress={() => navigation.navigate('Onboarding Congrats')}
        title="Continue"
      />
    </ScreenView>
  );
};
export default StudioHoursScreen;
