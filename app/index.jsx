import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import {Link} from 'expo-router';
import BottomBar from '../components/bottomBar';


export default function App() {
  return (
    <View className="flex-1 bg-primary text-center">
      <Text className="font-iregular text-secondary alignItems-center">Welcome!</Text>
      <StatusBar />
      <Link href="/calendar" className= "text-tertiary top-10">Go to Calendar</Link>
</View>


  );
}

