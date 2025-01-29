import { View, Text, TextInput, Alert} from 'react-native';
import React, { useState } from 'react';
import { Link, Stack } from 'expo-router';
import {supabase} from '../../lib/supabase' 
import Button from '../../components/Button';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);


  async function signUpWithEmail() {
    setLoading(true);
    const {error} = await supabase.auth.signUp({ email, password })
    if (error){
      Alert.alert(error.message)
    };
    setLoading(false);
  }

  return (
    <View className = "bg-primary p-20 flex justify-center">
      <Stack.Screen options={{ title: 'Sign up' }} />

      <Text className = "text-greyshade">Em</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        className = "border-1 border-greyshade p-10 mt-5 mb-20 bg-secondary rounded-sm"
      />

      <Text className = "text-greyshade">Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder=""
        className = "border-1 border-greyshade p-10 mt-5 mb-20 bg-secondary rounded-sm"
        secureTextEntry
      />
      <Button onPress={signUpWithEmail} disabled={loading} text={loading? 'Creating Account..' : 'Create Account'} />
      <Link href="/sign-in" className = "self-center font-bold my-12 text-secondary text-lg">
        Sign in
      </Link>
    </View>
  );
};

export default SignUp;