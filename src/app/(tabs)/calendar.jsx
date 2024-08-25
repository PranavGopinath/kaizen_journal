import { StyleSheet, Text, View, ScrollView } from 'react-native'
import {React, useState} from 'react'
import {dateGenerator} from '../../components/calendarDates'
import {months} from '../../components/calendarDates'
import {SafeAreaView} from 'react-native-safe-area-context'
import dayjs from "dayjs";
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Calendar = () => {
  const days = ["S", "M", "T", "W", "T", "F", "S"]
  const currentDate = dayjs();
  const [today,setToday] = useState(currentDate);
  const calendarDate = dayjs();


  return (
    <ScrollView>
      <View className = "bg-primary w-screen h-screen">
        <View className="flex flex-row items-center h-10 pl-7 flex-basis-100">
          <View className="flex flex-row items-center h-10 grow">
          <MaterialIcons iconStyle={{right:3}}  name="navigate-before" size={25} color="#EAEAEA" className="w-5 h-5 cursor-pointer z-1000" onPress={() => {
              setToday(today.month(today.month()-1))
            }}/>
          <Text className = "text-secondary font-semibold">
            {months[today.month()]} {today.year()}
          </Text>
          <MaterialIcons iconStyle={{right:3}}  name="navigate-next" size={25} color="#EAEAEA" className="w-5 h-5 cursor-pointer z-1000" onPress={() => {
              setToday(today.month(today.month()+1))
            }}/>
          </View>
          <View className = "right-10">
          <MaterialCommunityIcons name="calendar-arrow-left" size={25} color="white" />
          </View>
        </View>
        <View className = "flex flex-row text-center justify-center pt-1">
          {days.map((day, index) => {
            return <Text  className = " text-tertiary text-lg w-12 h-12 font-bold text-center border-t" key = {index}>{day}</Text>;
        })}
        </View>
        <View className = "flex flex-wrap flex-row justify-center pl-1 pr-1 items-center">
      {dateGenerator(today.month(), today.year()).map(({date, currentMonth, today}, index) =>{
        return(
          <View className="h-12 w-12 border-t items-center justify-center" key={index}>
            <Text className={`${currentMonth ? 'text-secondary' : 'text-greyshade'} ${today ? '' : ''} w-12 h-12 text-lg text-center hover:bg-greyshade transition-all self-end`}>{date.date()}</Text>
          </View>
        )
      })}
        </View>
      </View>
    </ScrollView>
    
  )
}

export default Calendar
