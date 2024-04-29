import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import index from './index'

import { Slot, Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name = "index" options = {{headerShown:false}} />
    </Stack>
  )
}