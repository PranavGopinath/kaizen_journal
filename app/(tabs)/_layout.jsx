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
      {icon}
      <Text className={`${focused ? 'font-thick' : 'font-thin'}`}>
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
              tabBarShowLabel:false,
              tabBarActiveTintColor: "#0b7a75",
              tabBarInactiveTintColor: '#EAEAEA', 
            }}
          >
            <Tabs.Screen 
            name = "calendar" 
            options = {{
              headerShown:false,
              tabBarIcon: ({color, focused}) =>(
                <TabIcon 
                  icon={<Feather name="calendar" size={24} />}
                  color={color}
                  name="Calendar"
                  focused = {focused}
                />
              )
            }}/>
            <Tabs.Screen 
            name = "create" 
            options = {{
              headerShown:false,
              tabBarIcon: ({color, focused}) =>(
                <TabIcon 
                  icon={<Ionicons name="create" size={24} />}
                  color={color}
                  name="Create"
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
                  icon={<Feather name="target" size={24} />}
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
                  icon={<MaterialCommunityIcons name="account" size={24} />}
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