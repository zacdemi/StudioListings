import React, { useState, useEffect } from 'react';
import { Switch, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { tw, color } from 'react-native-tailwindcss';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import { useMutation } from '@apollo/react-hooks';
import { ScreenView, Input, InputContainer, Button } from 'components';
import DateTimePicker from '@react-native-community/datetimepicker';
import { UPDATE_MY_STUDIO_HOURS_OF_OPERATION, GET_MY_STUDIO } from 'api';

const getShortTime = time => {
  const timeFormat = moment(time, 'LT');
  const isWholeNumber = timeFormat.minutes() === 0;
  if (isWholeNumber) {
    const hour = timeFormat
      .format('LT')
      .toString()
      .slice(-8, -6);
    return `${hour} ${timeFormat.format('A')}`;
  }
  return `${timeFormat.format('LT')}`;
};

const weekdays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const compileTimes = hoursOfOperations =>
  hoursOfOperations.reduce((acc, curr) => {
    const existingTimes = acc[curr.day] ? acc[curr.day].rawTimes : [];
    return {
      ...acc,
      [curr.day]: {
        day: curr.day,
        rawTimes: [
          ...existingTimes,
          {
            startTime: curr.startTime,
            endTime: curr.endTime,
          },
        ],
      },
    };
  }, {});

const StudioEditHoursScreen = () => {
  const route = useRoute();
  const editMode = route.params && route.params.edit;
  const navigation = useNavigation();
  const studio = useSelector(
    state => state.myStudios.studios[state.myStudios.currentStudioId],
  );
  const [studioSchedule, setStudioSchedule] = useState(
    compileTimes(
      studio.studioHoursOfOperation ? studio.studioHoursOfOperation : [],
    ),
  );

  const [updateMyStudioHoursOfOperation] = useMutation(
    UPDATE_MY_STUDIO_HOURS_OF_OPERATION,
    {
      refetchQueries: [
        { query: GET_MY_STUDIO, variables: { studioId: studio.id } },
      ],
      awaitRefetchQueries: true,
    },
  );

  const updateSchedule = async (day, newTimes) => {
    let newStudioSchedule = { ...studioSchedule };

    if (newTimes.length) {
      newStudioSchedule = {
        ...studioSchedule,
        [day]: { day, rawTimes: newTimes },
      };
    } else {
      delete newStudioSchedule[day];
    }
    setStudioSchedule(newStudioSchedule);
  };

  const TimePicker = ({ day, onUpdateSchedule, startTime, endTime }) => {
    const [openTime, setOpenTime] = useState(moment(startTime, 'LT').toDate());
    const [closeTime, setCloseTime] = useState(moment(endTime, 'LT').toDate());
    const [showPickerType, setShowPickerType] = useState('none'); //close, open, none
    const [invalidTime, setInvalidTime] = useState(false);

    return (
      <>
        <View style={[tw.justifyStart, tw.flexRow, tw.itemsCenter, tw.mB4]}>
          <TouchableOpacity
            style={[tw.h5, tw.borderB, tw.borderGray400, tw.justifyCenter]}
            onPress={() => setShowPickerType('open')}>
            <Text>{openTime && getShortTime(openTime)}</Text>
          </TouchableOpacity>
          <Text style={[tw.mX4]}>-</Text>
          <TouchableOpacity
            style={[tw.h5, tw.borderB, tw.borderGray400, tw.justifyCenter]}
            onPress={() => setShowPickerType('close')}>
            <Text style={invalidTime && [tw.textRed300]}>
              {closeTime && getShortTime(closeTime)}
            </Text>
          </TouchableOpacity>
        </View>
        {showPickerType !== 'none' && (
          <>
            <View style={[tw.flexRow, tw.justifyEnd]}>
              <TouchableOpacity
                onPress={() => {
                  console.log('dif', closeTime - openTime);
                  if (closeTime - openTime < 0) {
                    console.log('invalid time');
                    setInvalidTime(true);
                  }
                  setShowPickerType('none');

                  onUpdateSchedule(day, [
                    {
                      startTime: moment(openTime).format('hh:mm:ss'),
                      endTime: moment(closeTime).format('hh:mm:ss'),
                    },
                  ]);
                }}>
                <Text style={[tw.textLg]}>Save</Text>
              </TouchableOpacity>
            </View>
            {console.log('close time', closeTime, openTime)}
            <DateTimePicker
              testID="dateTimePicker"
              value={showPickerType === 'close' ? closeTime : openTime}
              mode={'time'}
              is24Hour={true}
              minuteInterval={30}
              display="compact"
              onChange={(event, selectedTime) => {
                showPickerType === 'close'
                  ? setCloseTime(selectedTime)
                  : setOpenTime(selectedTime);
              }}
            />
          </>
        )}
      </>
    );
  };

  const Day = ({ day, times, onUpdateSchedule }) => {
    const open = !!times.length;
    const openAllDay =
      open &&
      times[0].startTime === '00:00:00' &&
      times[0].endTime === '24:00:00';
    return (
      <View>
        <View
          style={[
            tw.flexRow,
            tw.justifyBetween,
            tw.mB3,
            tw.itemsCenter,
            tw.borderB,
            tw.borderGray400,
          ]}>
          <Text style={[tw.fontSemiBold, tw.fontLg]}>{weekdays[day]}</Text>
          <View style={[tw.flexRow, tw.itemsCenter]}>
            <Switch
              trackColor={{ false: color.gray500, true: color.green600 }}
              thumbColor={open ? color.white : color.white}
              ios_backgroundColor="#3e3e3e"
              onValueChange={bool =>
                open
                  ? onUpdateSchedule(day, [])
                  : onUpdateSchedule(day, [
                      { startTime: '00:00:00', endTime: '24:00:00' },
                    ])
              }
              style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
              value={open}
            />
            <Text style={[tw.w12]}>{open ? 'Open' : 'Closed'}</Text>
          </View>
        </View>

        {open && (
          <View style={[tw.mL4]}>
            <View style={[tw.flexRow, tw.mB3, tw.itemsCenter]}>
              <Text>24 Hours</Text>
              <Switch
                trackColor={{ false: color.gray500, true: color.green600 }}
                thumbColor={open ? color.white : color.white}
                ios_backgroundColor="#3e3e3e"
                onValueChange={bool => {
                  openAllDay
                    ? onUpdateSchedule(day, [
                        { startTime: '09:00:00', endTime: '17:00:00' },
                      ])
                    : onUpdateSchedule(day, [
                        { startTime: '00:00:00', endTime: '24:00:00' },
                      ]);
                }}
                style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                value={openAllDay}
              />
            </View>
            <View>
              {times.map((time, index) => (
                <TimePicker
                  key={index}
                  day={day}
                  startTime={time.startTime}
                  endTime={time.endTime}
                  times={time}
                  onUpdateSchedule={(day, newTimes) =>
                    onUpdateSchedule(day, newTimes)
                  }
                />
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenView style={[tw.flex1]}>
      <ScrollView style={[tw.flex1]} showsVerticalScrollIndicator={false}>
        {Array.from({ length: 7 }).map((_, index) => {
          const times = studioSchedule[index]
            ? studioSchedule[index].rawTimes
            : [];
          return (
            <Day
              key={index}
              onUpdateSchedule={(day, newTimes) => {
                updateSchedule(day, newTimes);
              }}
              day={index}
              // open={day.open}
              times={times}
            />
          );
        })}
      </ScrollView>
      <Button
        style={[tw.wFull, tw.roundedSm, tw.pY3, tw.bgBlack, tw.mTAuto]}
        onPress={async () => {
          const res = await updateMyStudioHoursOfOperation({
            variables: {
              studioId: studio.id,
              hoursOfOperation: Object.values(studioSchedule).reduce(
                (acc, curr) => [
                  ...acc,
                  ...curr.rawTimes.map(time => ({
                    ...time,
                    day: curr.day,
                  })),
                ],
                [],
              ),
            },
          });
          // route.params.onReturn(studioSchedule);
          if (editMode) {
            navigation.navigate('My Studio Details');
            navigation.popToTop();
          } else {
            navigation.navigate('Onboarding Congrats');
          }
        }}
        title="Done"
      />
    </ScreenView>
  );
};
export default StudioEditHoursScreen;
