import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View } from 'react-native';
import {Link} from 'expo-router';
import BottomBar from '../components/bottomBar';
import {SafeAreaView} from 'react-native-safe-area-context'
import { Image } from 'react-native';

export default function App() {
  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{height:'100%'}}>
        <View>
          <Image
            source={require("../assets/images/logo.png")}
          />
        <Link href="/calendar" className= "text-tertiary top-10">Go to Calendar</Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

