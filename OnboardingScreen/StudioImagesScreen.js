import React, { useState, useEffect } from 'react';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import AsyncStorage from '@react-native-community/async-storage';
import { useLazyQuery, useMutation } from '@apollo/react-hooks';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import ImagePicker from 'react-native-image-picker';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Spinner from 'react-native-spinkit';

import { setJwt, updateMyStudioImage } from 'state/actions';
import { ScreenView, Button, SkipButton } from 'components';
import { ADD_MY_STUDIO_IMAGE, DELETE_MY_STUDIO_IMAGE } from 'api';
import { displayStudioImage } from 'utils/';

import { useS3Upload } from '../../../../../utils/hooks';
import { lastIndexOf } from 'lodash';

const StudioImagesScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const [addMyStudioImage] = useMutation(ADD_MY_STUDIO_IMAGE);
  const [deleteMyStudioImage] = useMutation(DELETE_MY_STUDIO_IMAGE);

  const { uploads, uploadToS3 } = useS3Upload();

  const [imageArray, setImageArray] = useState([]);

  const currentStudio = useSelector(
    state => state.myStudios.studios[state.myStudios.currentStudioId],
  );
  const editMode = route.params && route.params.edit;

  const { width } = Dimensions.get('window');

  const squareWidth = width - 32; // subtract horizontal padding of 16
  const squareSpacer = 5;

  useEffect(() => {
    const { studioImages = [] } = currentStudio;

    const studioImagesArray = Object.keys(studioImages).map((key, index) => {
      return studioImages[key];
    });

    const newImageArray = new Array(9).fill().map((_, index) => {
      if (studioImages && index < studioImagesArray.length) {
        return {
          id: index,
          picture: studioImagesArray[index].picture,
          loading: false,
        };
      }
      return { id: '', picture: '', loading: false };
    });

    setImageArray(newImageArray);
  }, []);

  const setImageLoading = (index, bool) => {
    const newImageArray = [...imageArray];
    newImageArray[index] = { ...newImageArray[index], loading: bool };
    setImageArray(newImageArray);
  };

  const handleGetImage = async index => {
    setImageLoading(index, true);

    const options = {
      title: 'Select Studio Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.showImagePicker(options, async response => {
      if (response.didCancel) {
        setImageLoading(index, false);
      } else if (response.error) {
        setImageLoading(index, false);
      } else {
        const existingImage = imageArray.find(item => item.id === index);
        console.log('existing image', existingImage, imageArray);
        if (existingImage) {
          const {
            data: {
              deleteMyStudioImage: {
                studioImage: { picture },
              },
            },
          } = await deleteMyStudioImage({
            variables: {
              studioId: currentStudio.id,
              picture: existingImage.picture,
            },
          });
        }

        const fileName = await uploadToS3({
          id: index,
          file: response,
          purpose: 'studio',
        });
        const {
          data: {
            addMyStudioImage: { studioImage },
          },
        } = await addMyStudioImage({
          variables: {
            studioId: currentStudio.id,
            picture: fileName,
            index,
            isDefault: !index,
          },
        });

        const newImageArray = [...imageArray];
        newImageArray[index] = {
          id: index,
          picture: studioImage.picture,
          loading: false,
        };
        setImageArray(newImageArray);

        console.log('dispatch', index, currentStudio.id, studioImage);
        dispatch(
          updateMyStudioImage(currentStudio.id, {
            [index]: studioImage,
            // studioImages: [...(currentStudio.studioImages || []), { picture }],
          }),
        );
      }
    });
  };

  return (
    <ScreenView style={[tw.flex1, tw.justifyCenter]}>
      <SkipButton
        onPress={() => navigation.navigate('Studio Equipment')}
        style={[tw.mR2, tw.mT2, tw.absolute, tw.top0, tw.right0]}
        hide={editMode}
      />
      <Text style={[tw.mT2, tw.mB8, tw.text2xl, tw.fontBold, tw.textCenter]}>
        {editMode ? 'Edit Images' : 'Add Images'}
      </Text>
      <View
        style={[
          { height: squareWidth },
          tw.flexRow,
          tw.flexWrap,
          tw.justifyBetween,
          tw.contentBetween,
        ]}>
        {imageArray.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleGetImage(index)}
            style={[
              {
                width: (squareWidth - squareSpacer) / 3,
                height: (squareWidth - squareSpacer) / 3,
              },
              tw.bgGray400,
              tw.justifyCenter,
              tw.itemsCenter,
            ]}>
            {item.loading ? (
              <Spinner
                size={48}
                style={[tw.pY0, tw.mY0, tw.absolute]}
                color="white"
                type="ThreeBounce"
              />
            ) : item.picture ? (
              <Image
                style={[tw.wFull, tw.hFull]}
                source={{
                  uri: displayStudioImage(item.picture),
                }}
              />
            ) : (
              <MaterialIcon name="add-a-photo" size={28} color="gray" />
            )}
          </TouchableOpacity>
        ))}
      </View>
      <Button
        style={[tw.wFull, tw.roundedSm, tw.pY3, tw.bgBlack, tw.mTAuto]}
        onPress={() => {
          if (editMode) {
            navigation.navigate('My Studio Details');
            navigation.popToTop();
          } else {
            navigation.navigate('Studio Equipment');
          }
        }}
        title={editMode ? 'Done' : 'Continue'}
      />
    </ScreenView>
  );
};
export default StudioImagesScreen;
