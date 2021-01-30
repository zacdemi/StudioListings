import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  View,
} from 'react-native';
import { tw, color } from 'react-native-tailwindcss';
import AsyncStorage from '@react-native-community/async-storage';
import { useLazyQuery, useMutation } from '@apollo/react-hooks';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import RNPickerSelect from 'react-native-picker-select';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { UPDATE_MY_STUDIO_ACCESSORIES } from 'api/mutations';
import { updateMyStudio } from 'state/actions';

import { ScreenView, Button, SkipButton } from 'components';

const StudioEquipmentScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const [updateMyStudioAccessories] = useMutation(UPDATE_MY_STUDIO_ACCESSORIES);

  const currentStudio = useSelector(
    state => state.myStudios.studios[state.myStudios.currentStudioId],
  );

  const editMode = route.params && route.params.edit;
  const { control, handleSubmit, errors, getValues } = useForm();
  const [equipment, setEquipment] = useState([]);

  useEffect(() => {
    setEquipment(currentStudio.studioAccessories || []);
  }, []);

  const onSubmit = async () => {
    try {
      const {
        data: {
          updateMyStudioAccessories: { studioAccessories },
        },
      } = await updateMyStudioAccessories({
        variables: {
          studioId: currentStudio.id,
          accessories: equipment.map(({ description, type }) => ({
            description,
            type,
          })),
        },
      });
      dispatch(
        updateMyStudio(currentStudio.id, {
          studioAccessories: [
            ...studioAccessories.map(({ type, description }) => ({
              type,
              description,
            })),
          ],
        }),
      );
      if (editMode) {
        navigation.navigate('My Studio Details');
        navigation.popToTop();
      } else {
        navigation.navigate('Studio Rates');
      }
    } catch (err) {
      console.log('Err', err);
    }
  };

  const handleAddEquipment = data => {
    console.log('add equipment data', data);
    const newItem = {
      id: Date.now(),
      ...data,
    };
    setEquipment([...equipment, newItem]);
  };

  const handleRemoveEquipment = id => {
    const index = equipment.findIndex(obj => obj.id === id);

    const newEquipment = [...equipment];
    newEquipment.splice(index, 1);

    setEquipment(newEquipment);
  };

  return (
    <ScreenView style={[tw.flex1]}>
      <SkipButton
        onPress={() => navigation.navigate('Studio Rates')}
        style={[tw.mR2, tw.mT2, tw.absolute, tw.top0, tw.right0]}
        hide={editMode}
      />
      <Text style={[tw.mT2, tw.mB8, tw.text2xl, tw.fontBold, tw.textCenter]}>
        Add your equipment
      </Text>
      <View style={[tw.mB3]}>
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
              onValueChange={value => onChange(value)}
              items={[
                { label: 'Keyboard', value: 'keyboard' },
                { label: 'Drums', value: 'drums' },
                { label: 'Guitar', value: 'guitar' },
                { label: 'Mic', value: 'mic' },
                { label: 'Speakers', value: 'speakers' },
                { label: 'DAW', value: 'daw' },
                { label: 'Studio Booth', value: 'studio booth' },
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
          name="type"
          rules={{
            required: 'Type required',
          }}
          defaultValue=""
        />
        {errors.type && (
          <Text style={[tw.textRed600, tw.mT1]}>{errors.type.message}</Text>
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
              placeholder="Description"
              placeholderTextColor="grey"
              value={value}
            />
          )}
          name="description"
          rules={{
            required: 'Description Required',
          }}
          defaultValue=""
        />
        {errors.name && (
          <Text style={[tw.textRed600, tw.mT1]}>{errors.name.message}</Text>
        )}
      </View>
      <TouchableOpacity
        onPress={handleSubmit(handleAddEquipment)}
        style={[
          tw.h10,
          tw.justifyCenter,
          tw.itemsCenter,
          tw.border1,
          tw.bgGray500,
          tw.mX24,
          tw.mB3,
          tw.roundedFull,
        ]}>
        <MaterialIcon name="add" size={30} color={color.gray900} />
      </TouchableOpacity>
      <ScrollView style={[tw.flex1]}>
        {equipment.map((item, index) => (
          <View
            style={[
              tw.flexRow,
              tw.roundedFull,
              tw.justifyBetween,
              tw.itemsCenter,
              tw.bgGray300,
              tw.h6,
              tw.pX2,
              tw.mB1,
            ]}>
            <Text>{`${item.type} ${item.description} `}</Text>
            <TouchableOpacity onPress={() => handleRemoveEquipment(item.id)}>
              <MaterialIcon name="delete" size={20} color={color.gray800} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <Button
        style={[tw.wFull, tw.roundedSm, tw.pY3, tw.bgBlack, tw.mT3]}
        onPress={onSubmit}
        title={editMode ? 'Done' : 'Continue'}
      />
    </ScreenView>
  );
};
export default StudioEquipmentScreen;
