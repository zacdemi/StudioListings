import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import { useMutation } from '@apollo/react-hooks';
import { useNavigation } from '@react-navigation/native';
import { dispatch } from 'react-redux';
import { ScreenView, Button, SkipButton } from 'components';
import { useMyUser, useMyStudio, studioProgress } from 'utils';
import { UPDATE_MY_STUDIO, GET_MY_STUDIO } from 'api';
import { updateMyStudio as updateMyStudioRedux } from 'state/actions';


const OnboardingCongratsScreen = () => {
  const navigation = useNavigation();
  const user = useMyUser();
  const studio = useMyStudio();
  const [updateMyStudio] = useMutation(UPDATE_MY_STUDIO);


  useEffect(() => {
    const makeLive = async () => {
      try {
        const {
          data: { updateMyStudio: updateMyStudioResponse },
        } = await updateMyStudio({
          variables: {
            id: studio.id,
            live: !studio.live,
          },
        });
        dispatch(updateMyStudioRedux(studio.id, { ...updateMyStudioResponse }));
      } catch (err) {
        console.log('error', err);
      }
    };

    makeLive();
  }, []);

  return (
    <ScreenView style={[tw.flex1]}>
      <SkipButton
        onPress={() => navigation.navigate('Listings')}
        style={[tw.mR2, tw.mT2, tw.absolute, tw.top0, tw.right0]}
      />
      <View style={[tw.mT12]}>
        <Text style={[tw.text2xl, tw.fontBold, tw.textCenter]}>
          You have completed your studio posting! Your studio is now live.
        </Text>

      </View>
      {!user.stripeStatus || user.stripeStatus === 'incomplete' ? (
        <View style={[tw.mTAuto]}>
          <Text style={[tw.text2xl, tw.fontBold, tw.textCenter, tw.mB8, tw.pT6]}>
            Connect your bank or credit card to Strip so that you can get paid.
          </Text>
          <Button
            style={[tw.wFull, tw.roundedSm, tw.pY3, tw.bgBlack, tw.mTAuto]}
            onPress={() => {
              navigation.navigate('Stripe');
            }}
            title="Connect to Stripe"
          />
        </View>
      ) : null}

    </ScreenView>
  );
};

export default OnboardingCongratsScreen;
