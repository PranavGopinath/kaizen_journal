import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import dayjs from "dayjs";

const Header = ({heading}) => {
  return (
    <View className = "flex w-32 rounded-md left-5 top-10 bg-greyshade items-center">
        <Text className = "text-secondary">
        {typeof heading === 'object' ? JSON.stringify(heading) : heading}
        </Text>
      </View>
  )
}

export default Header

