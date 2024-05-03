import { Text, View } from 'react-native';
import { BsCalendar4Week } from "react-icons/bs";
import { AntDesign } from '@expo/vector-icons';

const BottomBar = () => {
    return(
        <View className = "fixed bottom-0 h-10 w-screen flex flex-row bg-tertiary text-white boxShadow-lg">
            <BottomBarIcon icon={<AntDesign name="calendar" size={24} color="black" />}/>
            <BottomBarIcon icon={<AntDesign name="calendar" size={24} color="black" />}/>
            <BottomBarIcon icon={<AntDesign name="calendar" size={24} color="black" />}/>
            <BottomBarIcon icon={<AntDesign name="calendar" size={24} color="black" />}/>
            <BottomBarIcon icon={<AntDesign name="calendar" size={24} color="black" />}/>
            <BottomBarIcon icon={<AntDesign name="calendar" size={24} color="black" />}/>
        </View>
    )
};

const BottomBarIcon = ({icon}) => (
    <View className = "sidebar-icon">
        {icon}
    </View>
);

export default BottomBar;