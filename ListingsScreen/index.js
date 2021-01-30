import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { tw, colors } from 'react-native-tailwindcss';
import { useApolloClient, useMutation } from '@apollo/react-hooks';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { addMyStudios, addMyCurrentStudio } from 'state/actions';
import { OnboardingProgressTag, Button, ScreenView } from 'components';
import ImageCarousel from 'components/ui/ImageCarousel';
import { GET_MY_STUDIOS, CREATE_MY_STUDIO } from 'api';

const ListingsScreen = () => {
  const navigation = useNavigation();
  const client = useApolloClient();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const studios = useSelector(state => state.myStudios.studios);
  const [createMyStudio] = useMutation(CREATE_MY_STUDIO);

  const studioArray = Object.keys(studios).map((key, index) => {
    return studios[key];
  });

  console.log('studios', studios);

  const { width } = Dimensions.get('window');
  const screenViewPadding = 48;

  useEffect(() => {
    client
      .query({
        query: GET_MY_STUDIOS,
      })
      .then(({ data: { myStudios: studiosResponse } }) => {
        const myStudios = studiosResponse.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.id]: curr,
          }),
          {},
        );
        dispatch(addMyStudios(myStudios));
        setLoading(false);
      })
      .catch(err => {
        console.log('Error getting my studios', err);
      });
  }, []);

  const handleStudioPressed = studio => {
    dispatch(addMyCurrentStudio(studio.id));
    navigation.navigate('My Studio Details');
  };

  const createStudio = async () => {
    try {
      const {
        data: {
          createMyStudio: { studio: myStudio },
        },
      } = await createMyStudio();

      console.log('sudio id', myStudio.id);

      dispatch(addMyCurrentStudio(myStudio.id));

      dispatch(
        addMyStudios({
          [myStudio.id]: myStudio,
        }),
      );
      navigation.navigate('Onboarding');
    } catch (err) {
      console.log('errrr', err);
    }
  };

  if (loading) {
    return null;
  }

  if (!studioArray.length) {
    return (
      <ScreenView style={[tw.flex1, tw.justifyCenter]}>
        <Text style={[tw.mB8, tw.text2xl, tw.fontBold, tw.textCenter]}>
          Post your first studio listing.
        </Text>
        <Button
          style={[tw.wFull, tw.roundedSm, tw.pY3, tw.bgBlack]}
          onPress={() => createStudio()}
          title="Get Started"
        />
      </ScreenView>
    );
  }

  return (
    <>
      <ScrollView style={[tw.pT8]}>
        <View style={[tw.pX6]}>
          <View style={[tw.mT6]}>
            {studioArray.map(studio => (
              <View key={studio.id} style={[tw.wFull, tw.mB12]}>
                <View style={{ height: 200 }}>
                  <ImageCarousel
                    data={studio.studioImages}
                    sliderWidth={width - screenViewPadding}
                    itemWidth={width - screenViewPadding}
                    onPress={() => {
                      handleStudioPressed(studio);
                    }}
                  />
                  <View
                    style={[tw.absolute, tw.top0, tw.right0, tw.mR2, tw.mT2]}>
                    <OnboardingProgressTag studio={studio} />
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    handleStudioPressed(studio);
                  }}
                  style={[tw.mT2]}>
                  <Text style={[tw.mTPx]}>
                    {studio.name ? studio.name : 'New Studio'}
                  </Text>
                  <Text style={[tw.mTPx]} numberOfLines={1}>
                    {studio.description
                      ? studio.description
                      : 'My New Studio Description'}
                  </Text>
                  {/* <Text style={[tw.fontSemibold, tw.mT1]}>
                      <Price price={studio.hourlyRate} toFixed={false} />
                      <Text> / hour</Text>
                    </Text> */}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={() => createStudio()}
        style={[
          tw.absolute,
          tw.roundedFull,
          { width: 55, height: 55 },
          tw.right0,
          tw.bottom0,
          tw.bgBlack,
          tw.justifyCenter,
          tw.itemsCenter,
          tw.mR4,
          tw.mB4,
          tw.shadowMd,
        ]}>
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>
    </>
  );
};

export default ListingsScreen;
