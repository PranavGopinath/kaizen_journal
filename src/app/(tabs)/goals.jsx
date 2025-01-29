import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { List } from 'react-native-paper';


const Goals = () => {
  const [goals, setGoals] = useState([
    { id: 1, title: "Finish the React project", completed: false },
    { id: 2, title: "Workout 3 times a week", completed: true },
    { id: 3, title: "Read a new book", completed: false }, 
  ]);

  const toggleGoalCompletion = (id) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === id) {
        return { ...goal, completed: !goal.completed };
      }
      return goal;
    });
    setGoals(updatedGoals);
  };

  return (
    <ScrollView className="bg-gray-900 h-full">
      <View className="flex-row items-center justify-between px-4 pt-5 pb-3">
        <Text className="text-white text-lg font-bold">My Goals</Text>
        <MaterialCommunityIcons name="plus-circle" size={25} color="white" onPress={() => {/* navigate to add new goal */}} />
      </View>
      {goals.map((goal) => (
        <TouchableOpacity key={goal.id} className="flex-row items-center justify-between px-5 py-3 border-b border-gray-700" onPress={() => toggleGoalCompletion(goal.id)}>
          <Text className={`${goal.completed ? 'line-through text-gray-500' : 'text-white'} text-lg`}>{goal.title}</Text>
          <MaterialIcons name={goal.completed ? "check-circle" : "radio-button-unchecked"} size={24} color="#EAEAEA" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default Goals;
