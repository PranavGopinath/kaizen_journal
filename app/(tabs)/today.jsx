import {View, Text, ScrollView } from 'react-native'
import React, {useState} from 'react'
import {months} from '../../components/calendarDates'
import dayjs from "dayjs";
import Header from "../../components/Header";
import CheckBox from '../../components/CheckBox';
import ListItem from '../../components/ListItem';

const Today = () => {
  const currentDate = dayjs();
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);
  const [checkbox3, setCheckbox3] = useState(false);
  const checklist  = "Checklist";
  const gratitude  = "Gratitude";
  const gratitude1 = " 1. "
  const gratitude2 = " 2. "
  const reflection = "Daily Reflection"
  return (
    <ScrollView>
      <View className = "bg-primary w-screen h-screen">
      <View className="flex items-center top-5 h-5">
      <Text className = "text-secondary font-bold text-base">{months[currentDate.month()]} {currentDate.date()}, {currentDate.year()}
      </Text>
      </View>
      <View className = "flex justify-center content-evenly">
      <Header 
          heading = {checklist}
        />
      <View className = "top-10">
      <CheckBox
            title= "Item 1"
            isChecked={checkbox1}
            onPress={() => setCheckbox1(!checkbox1)}
          />
          <CheckBox
            title= "Item 2"
            isChecked={checkbox2}
            onPress={() => setCheckbox2(!checkbox2)}
          />
          <CheckBox
            title= "Item 3"
            isChecked={checkbox3}
            onPress={() => setCheckbox3(!checkbox3)}
          />
      <Header 
        heading = {gratitude}
        />
      <ListItem 
        index = {gratitude1}
      />
      <ListItem 
        index = {gratitude2}
      />
      <Header 
        heading = {reflection}
        />
        </View>
      </View>
      </View>
    </ScrollView>
  )
}

export default Today