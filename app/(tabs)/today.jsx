import { View, Text } from 'react-native'
import React from 'react'
import {months} from '../../components/calendarDates'
import dayjs from "dayjs";

const Today = () => {

  const currentDate = dayjs();

  return (
    <View className="flex flex-auto items-center">
      <Text>{months[currentDate.month()]} {currentDate.date()}, {currentDate.year()}</Text>
      <View>
        
      </View>
    </View>
  )
}

export default Today