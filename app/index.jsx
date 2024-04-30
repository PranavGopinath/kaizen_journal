import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import {Link} from 'expo-router';

export default function App() {
  return (
    <View className="flex-1 bg-primary text-center">
      <Text className="font-iregular text-secondary alignItems-center">Welcome!</Text>
      <StatusBar />
      <Link href="/profile" className= "text-tertiary">Go to Profile</Link>
</View>


  );
}

