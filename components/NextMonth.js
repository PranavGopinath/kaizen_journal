import React from 'react';
import { View, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { MaterialIcons } from '@expo/vector-icons';
import dayjs from "dayjs";

export default function NextMonth() {
    const currentDate = dayjs();
    const [today,setToday] = useState(currentDate);
  return (
    <View>
      <MaterialIcons.Button iconStyle={{right:8.5}} name="navigate-next" size={15} color="black" className="w-5 h-5 cursor-pointer z-10" onPress={() => {
              setToday(today.month(today.month()+1))
            }}>
      </MaterialIcons.Button>
    </View>
  );
}
