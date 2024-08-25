import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import index from '.'
import {useFonts} from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import {useEffect} from 'react'
import {Tabs, Redirect} from 'expo-router';
import "../../styles/styles.css"


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "Inter-Regular": require("../../assets/fonts/Inter-Regular.ttf"),
    "Inter-Black": require("../../assets/fonts/Inter-Black.ttf"),
    "Inter-Bold": require("../../assets/fonts/Inter-Bold.ttf"),
    "Inter-Thin": require("../../assets/fonts/Inter-Thin.ttf"),
    "Inter-Light": require("../../assets/fonts/Inter-Light.ttf"),
    "Inter-Italic": require("../../assets/fonts/Inter-Italic.ttf")
  });

  useEffect(() =>{
   if (error) throw error;
   
   if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error])

  if(!fontsLoaded && !error) return null;

  return (
    <Stack>
      <Stack.Screen name = "index" options = {{headerShown:false}} />
    </Stack>
  )
}