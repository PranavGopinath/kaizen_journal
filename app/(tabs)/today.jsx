import { View, Text, TextInput } from 'react-native'
import CheckBox from '@react-native-community/checkbox'
import {React, useState} from 'react'
import {months} from '../../components/calendarDates'
import dayjs from "dayjs";

const Today = () => {

  const currentDate = dayjs();
  const [isSelected, setSelection] = useState(false);

  return (
    <View className="flex flex-auto bg-primary">
      <Text className = "text-center text-secondary">{months[currentDate.month()]} {currentDate.date()}, {currentDate.year()}</Text>
      <Text className = "left-10 mt-3 pl-1 w-20 rounded-md bg-greyshade">Checklist:</Text>
      <View className = "flex left-10 flex-wrap overflow-hidden">
        <View className="flex flex-row mt-2 w-40 relative items-center">
        <CheckBox
          value={isSelected}
          onValueChange={setSelection}
        />
          <TextInput type="checkbox" id = "checklist1" className="pl-2 flex shrink-0 text-secondary"/>
        </View>
        <View className = "mt-2 w-40 bg-secondary relative">
          <Text>Checklist Item 2</Text>
        </View>
        
      </View>
    </View>
  )
}

export default Today