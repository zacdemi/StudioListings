import React, { useState } from 'react';
import {
  ActionSheetIOS,
  View,
  Text,
  TextInput,
  Image,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@apollo/react-hooks';
import { tw } from 'react-native-tailwindcss';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import ImagePicker from 'react-native-image-crop-picker';

import { UPDATE_USER } from 'api';
import { PROFILE_IMAGE_PLACEHOLDER } from 'assets/images';
import { ScreenView, Button } from 'components';
import { updateUser as reduxUpdateUser } from 'state/actions';
import { displaySmallImage, displayAvatarImage } from '../../../../../utils';
import { useS3Upload } from '../../../../../utils/hooks';

const imageConfig = {
  width: 300,
  height: 400,
  cropping: true,
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { control, handleSubmit, errors } = useForm();
  const [updateUser, { loading }] = useMutation(UPDATE_USER);
  const dispatch = useDispatch();
  const [image, setImage] = useState();
  const [imageError, setImageError] = useState(false);
  const { uploads, uploadToS3 } = useS3Upload();
  const [imageUploading, setImageUploading] = useState(false);

  const {
    firstName: stateFirstName,
    lastName: stateLastName,
    phoneNumber: statePhoneNumber,
    picture: statePicture,
  } = useSelector(state => state.user);

  const editMode = route.params;

  console.log('state picture', statePicture);

  const onSubmit = async ({ firstName, phoneNumber, lastName }) => {
    if (!image && !statePicture) {
      setImageError(true);
      return null;
    }

    try {
      let imageUpdate = statePicture;
      if (image) {
        setImageUploading(true);
        imageUpdate = await uploadToS3({
          id: 0,
          file: {
            type: image.mime,
            uri: image.sourceURL,
          },
          purpose: 'profile',
        });
        setImageUploading(false);
      }


      const {
        data: { updateUser: response },
      } = await updateUser({
        variables: {
          firstName,
          lastName,
          phoneNumber,
          ...(imageUpdate && { picture: imageUpdate }),
        },
      });
      console.log('response', response); // GETTING A NULL RESPONSE ON FEILDS
      dispatch(
        reduxUpdateUser({
          firstName,
          lastName,
          phoneNumber,
          picture: imageUpdate,
        }),
      );
      if (editMode) {
        navigation.navigate('Settings');
      } else {
        navigation.navigate('Listings');
      }
    } catch (err) {
      console.log('error updating user', err);
    }
  };

  const pickSingle = async () => {
    const selectedImage = await ImagePicker.openPicker({
      ...imageConfig,
      cropperCircleOverlay: true,
    });
    return selectedImage;
  };

  const pickCamera = async () => {
    const selectedImage = await ImagePicker.openCamera({
      ...imageConfig,
    });
    return selectedImage;
  };

  const handleGetImage = () =>
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Pick From Library', 'Take a Photo'],
        cancelButtonIndex: 0,
      },
      async buttonIndex => {
        if (buttonIndex === 0) {
          // cancel action
        } else if (buttonIndex === 1 || buttonIndex === 2) {
          let selectedImage;
          if (buttonIndex === 1) {
            selectedImage = await pickSingle();
          } else {
            selectedImage = await pickCamera();
          }
          setImage(selectedImage);
          setImageError(false);
        }
      },
    );

  const imageSource = () => {
    if (image) {
      return { uri: image.sourceURL };
    }
    if (statePicture) {
      return { uri: displayAvatarImage(statePicture) };
    }
    return PROFILE_IMAGE_PLACEHOLDER;
  };

  return (
    <ScreenView style={[tw.flex1]} dismissKeyboard>
      <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter]}>
        <TouchableOpacity
          onPress={() => handleGetImage()}
          style={[
            tw.h40,
            tw.w40,
            tw.bgGray500,
            tw.roundedFull,
            tw.justifyCenter,
            tw.itemsCenter,
            tw.overflowHidden,
            imageError ? [tw.borderRed600, tw.border2] : [],
          ]}>
          <Image
            source={imageSource()}
            style={{ width: '100%', height: '100%' }}
          />
        </TouchableOpacity>
        {imageError && (
          <Text style={[tw.textRed700, tw.mT1]}>Image Required</Text>
        )}
      </View>
      <KeyboardAvoidingView
        style={[tw.flex1]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[tw.mB3]}>
          <Controller
            control={control}
            render={({ onChange, onBlur, value }) => (
              <TextInput
                autoCorrect={false}
                style={[tw.h10, tw.borderBlack, tw.border2, tw.padding, tw.pX2]}
                onBlur={onBlur}
                onChangeText={value => onChange(value)}
                placeholder={'First Name'}
                placeholderTextColor="grey"
                value={value}
              />
            )}
            name="firstName"
            rules={{
              required: 'First Name Required',
            }}
            defaultValue={stateFirstName}
          />
          {errors.firstName && (
            <Text style={[tw.textRed700, tw.mT1]}>
              {errors.firstName.message}
            </Text>
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
                placeholder={'Last Name'}
                placeholderTextColor="grey"
                value={value}
              />
            )}
            name="lastName"
            rules={{
              required: 'Last Name Required',
            }}
            defaultValue={stateLastName}
          />
          {errors.lastName && (
            <Text style={[tw.textRed600, tw.mT1]}>
              {errors.lastName.message}
            </Text>
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
                placeholder={'(000)-000-0000'}
                placeholderTextColor="grey"
                value={value}
                textContextType="telephoneNumber"
              />
            )}
            name="phoneNumber"
            rules={{
              required: 'Phone Number Required',
            }}
            defaultValue={statePhoneNumber}
          />
          {errors.phoneNumber && (
            <Text style={[tw.textRed600, tw.mT1]}>
              {errors.phoneNumber.message}
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
      <Button
        style={[tw.wFull, tw.roundedSm, tw.pY3, tw.bgBlack, tw.mTAuto]}
        onPress={handleSubmit(onSubmit)}
        title="Done"
        disabled={imageUploading}
      />
    </ScreenView>
  );
};

export default ProfileScreen;
