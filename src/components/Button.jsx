import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';

const Button = ({ onPress, text }) => {
  return (
    <Pressable onPress={onPress}>
            <View className = "flex w-32 rounded-md self-center top-10 bg-tertiary items-center text-lg h-5">
        <Text className = "text-secondary">
          {text}
        </Text>
      </View>

    </Pressable>
  )
}

export default Button

