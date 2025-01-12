import { StyleSheet, Text, View, TextInput } from 'react-native'
import React, {useState} from 'react'
import {Link, Stack} from 'expo-router'
import supabase from '../../lib/supabase'
import Button from '../../components/Button'

const SignIn  = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const {error} = await supabase.auth.signInWithPassword({ email, password })
    if (error){
      Alert.alert(error.message)
    };
    setLoading(false);
  }

  return (
    <View className =" bg-primary p-20 flex justify-center">
      <Stack.Screen options={{title: 'Sign-In'}} />
      <Text className ="text-greyshade"> Email </Text>
      <TextInput 
      value = {email}
      onChangeText = {setEmail}
      placeholder ="johndoe123@gmail.com"
      className ="border-1 border-greyshade p-10 mt-5 mb-20 bg-secondary rounded-sm"
      />
      <Text className = "text-greyshade">Password</Text>
      <TextInput 
      value = {password}
      onChangeText = {setPassword}
      placeholder = ""
      className ="border-1 border-greyshade p-10 mt-5 mb-20 bg-secondary rounded-sm"
      secureTextEntry
      />
      <Button onPress={signInWithEmail} disabled={loading} text={loading? 'Signing in ...' : 'Sign in'} />
      <Link href="/sign-up" className ="self-center text-tertiary text-lg font-bold my-10">
        Sign Up
      </Link>
    </View>
  )
}

export default SignIn 

const styles = StyleSheet.create({})