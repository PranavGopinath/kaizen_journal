import { StyleSheet, Text, View, ScrollView } from 'react-native'
import {React, useState} from 'react'
import {dateGenerator} from '../../components/calendarDates'
import {months} from '../../components/calendarDates'
import {SafeAreaView} from 'react-native-safe-area-context'
import dayjs from "dayjs";
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Calendar = () => {
  console.log(dateGenerator())
  const days = ["S", "M", "T", "W", "T", "F", "S"]
  const currentDate = dayjs();
  const [today,setToday] = useState(currentDate);



  return (
    <ScrollView>
      <View className = "bg-primary w-96 h-96">
        <View className="flex flex-row items-center">
          <Text className = "text-secondary font-semibold flex-1">
            {months[today.month()]} {today.year()}
          </Text>
          <View className = "flex flex-row items-center">
            <MaterialIcons.Button iconStyle={{right:3}} backgroundColor= "#1f1f1f" name="navigate-before" size={15} color="white" className="w-5 h-5 cursor-pointer" onPress={() => {
              setToday(today.month(today.month()-1))
            }}/>
            <MaterialIcons.Button iconStyle={{right:8.5}}backgroundColor= "#1f1f1f"name="navigate-next" size={15} color="white" className="w-5 h-5 cursor-pointer bg-secondary" onPress={() => {
              setToday(today.month(today.month()+1))
            }}/>
            <MaterialCommunityIcons name="calendar-arrow-left" size={15} color="white" />
          </View>
        </View>
        <View className = "grid grid-cols-7">
          {days.map((day, index) => {
            return <Text  className = " text-tertiary h-14 font-bold border-t grid place-content-center" key = {index}>{day}</Text>;
        })}
        </View>
        <View className = "grid grid-cols-7 grid-rows-6">
      {dateGenerator().map(({date, currentMonth, today}, index) =>{
        return(
          <View className="h-14 border-t grid place-content-center text-sm " key={index}>
            <Text className={`${currentMonth ? 'text-secondary' : 'text-greyshade'} ${today ? 'bg-tertiary ' : ''}, w-10 h-10 rounded-full grid place-content-center hover:bg-greyshade transition-all`}>{date.date()}</Text>
          </View>
        )
      })}
        </View>
      </View>
    </ScrollView>
    
  )
}

export default Calendar
