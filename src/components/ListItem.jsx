import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

const ListItem = ({index}) => {
  return (
    <View className = "flex justify-start items-center flex-row mt-16 ml-5">
        <Text className = "text-secondary text-lg ml-5">
        {typeof index === 'object' ? JSON.stringify(index) : index}
        </Text>
        <Text className = "text-sm text-greyshade">
            Click to add entry
        </Text>
      </View>
  )
}

export default ListItem

