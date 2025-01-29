import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const Profile = () => {
  const userInfo = {
    name: "John Doe",
    email: "john.doe@example.com",
    bio: "Passionate developer and tech enthusiast.",
    avatar: "https://via.placeholder.com/150"
  };

  return (
    <ScrollView className="bg-primary h-full">
      <View className="items-center p-4">
        <Image source={{ uri: userInfo.avatar }} className="h-24 w-24 rounded-full" />
        <Text className="text-white text-xl font-bold mt-3">{userInfo.name}</Text>
        <Text className="text-tertiary">{userInfo.email}</Text>
      </View>
      <View className="mt-5 px-4">
        <Text className="text-white text-sm font-semibold">Bio</Text>
        <Text className="text-gray-400 mt-1">{userInfo.bio}</Text>
      </View>
      <TouchableOpacity className="mt-5 mx-4 p-3 bg-tertiary rounded-lg items-center">
        <Text className="text-white text-lg">Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Profile;
