import {View, Text, ScrollView, TextInput } from 'react-native'
import React, {useState, useEffect} from 'react'
import {months} from '../../components/calendarDates'
import dayjs from "dayjs";
import Header from "../../components/Header";
import CheckBox from '../../components/CheckBox';
import ListItem from '../../components/ListItem';
// import supabase from '../../src/config/SupabaseClient'

const Today = () => {
  const currentDate = dayjs();
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);
  const [checkbox3, setCheckbox3] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [checklist, setChecklist] = useState(null);

// useEffect(() => {
//   const fetchChecklist = async () => {
//     const { data, error } = await supabase
//     .from('masterchecklist')
//     .select()

//     if (error){
//       setFetchError("Could not fetch the smoothies")
//       setChecklist(null)
//       console.log(error)
//     }

//     if (data) {
//       setChecklist(data)
//       setFetchError(null)
//     }
//   }

//   fetchChecklist()
// }

// )
  return (
    <ScrollView>
      <View className = "bg-primary w-screen h-screen">
        {fetchError && (<Text>{fetchError}</Text>)} 
        {checklist && (
          <View>{checklist.map(checkbox => (
            <Text>{checkbox.info}</Text>
          ))}
             </View>
        )}
      <View className="flex items-center top-5 h-5">
      <Text className = "text-secondary font-bold text-base">{months[currentDate.month()]} {currentDate.date()}, {currentDate.year()}
      </Text>
      </View>
      <View className = "flex justify-center content-evenly">
      <Header 
          heading = "Checklist"
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
        heading = "Gratitude"
        />
      <ListItem 
        index = "1."
      />
      <ListItem 
        index = "2."
      />
      <Header 
        heading = "Reflection"
        />
        </View>
      </View>
      </View>
    </ScrollView>
  )
}

export default Today