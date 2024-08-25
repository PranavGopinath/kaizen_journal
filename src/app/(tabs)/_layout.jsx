import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {Tabs, Redirect} from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
const TabIcon = ({icon, color, name, focused}) => {
  return (
    <View className="items-center justify-center">
      <View resizeMode="contain"
        tintColor={color}
        className="w-6 h-6 z-10" >{icon}</View>
      <Text className={`${focused ? 'font-thick' : 'font-thin'} text-secondary`}>
        {name}
      </Text>
    </View>
  )
  
}

const TabsLayout = () => {
    return (
        <>
          <Tabs
            screenOptions={{
              tabBarShowLabel: false,
              tabBarActiveTintColor: "#0B7A75",
              tabBarInactiveTintColor: "#EAEAEA", 
              tabBarStyle:{
                backgroundColor: "#1f1f1f"
              }
            }}
          >
            <Tabs.Screen 
              name = "calendar" 
              options = {{
                headerShown:false,
                tabBarIcon: ({color, focused}) =>(
                  <TabIcon 
                    icon={<Feather name="calendar" size={24} color={`${focused ? '#eaeaea' : '#7d8491'}`}/>}
                    color={color}
                    name="Calendar"
                    focused = {focused}
                />
              )
            }} />
            <Tabs.Screen 
            name = "today" 
            options = {{
              headerShown:false,
              tabBarIcon: ({color, focused}) =>(
                <TabIcon 
                  icon={<Ionicons name="create" size={24} color={`${focused ? '#eaeaea' : '#7d8491'}`}/>}
                  color={color}
                  name="Today"
                  focused = {focused}
                />
              )
            }}/>
            <Tabs.Screen 
            name = "goals" 
            options = {{
              headerShown:false,
              tabBarIcon: ({color, focused}) =>(
                <TabIcon 
                  icon={<Feather name="target" size={24} color={`${focused ? '#eaeaea' : '#7d8491'}`}/>}
                  color={color}
                  name="Goals"
                  focused = {focused}
                />
              )
            }}/>
            <Tabs.Screen 
            name = "profile" 
            options = {{
              headerShown:false,
              tabBarIcon: ({color, focused}) =>(
                <TabIcon 
                  icon={<MaterialCommunityIcons name="account" size={24} color={`${focused ? '#eaeaea' : '#7d8491'}`}/>}
                  color={color}
                  name="Profile"
                  focused = {focused}
                />
              )
            }}/>
          </Tabs>
        </>
      )
}

export default TabsLayout

const styles = StyleSheet.create({})