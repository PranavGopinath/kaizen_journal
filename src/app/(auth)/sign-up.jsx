import { View, Text, TextInput } from 'react-native';
import React, { useState } from 'react';
import { Link, Stack } from 'expo-router';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View className = "bg-primary p-20 flex justify-center">
      <Stack.Screen options={{ title: 'Sign up' }} />

      <Text className = "text-greyshade">Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="johndoe123@gmail.com"
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
      <Link href="/sign-in" className = "self-center font-bold my-10">
        Sign in
      </Link>
    </View>
  );
};

export default SignUp;