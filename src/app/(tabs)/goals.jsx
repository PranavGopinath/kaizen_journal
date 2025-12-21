import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { List, Chip, ProgressBar } from 'react-native-paper';
import { supabase } from '../../lib/supabase';
import dayjs from 'dayjs';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'personal',
    deadline: '',
    targetValue: '',
    currentValue: '0',
    unit: '',
    priority: 'medium'
  });
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    { key: 'personal', label: 'Personal', color: '#FF6B6B' },
    { key: 'health', label: 'Health', color: '#4ECDC4' },
    { key: 'career', label: 'Career', color: '#45B7D1' },
    { key: 'learning', label: 'Learning', color: '#96CEB4' },
    { key: 'financial', label: 'Financial', color: '#FFEAA7' }
  ];

  const priorities = [
    { key: 'low', label: 'Low', color: '#4CAF50' },
    { key: 'medium', label: 'Medium', color: '#FF9800' },
    { key: 'high', label: 'High', color: '#F44336' }
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchGoals();
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchGoals();
      }
    });
  }, []);

  const fetchGoals = async () => {
    if (!session?.user) return;
    
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoal.title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([{
          ...newGoal,
          user_id: session.user.id,
          created_at: new Date().toISOString(),
          completed: false
        }])
        .select();

      if (error) throw error;

      setGoals([...goals, data[0]]);
      setModalVisible(false);
      setNewGoal({
        title: '',
        description: '',
        category: 'personal',
        deadline: '',
        targetValue: '',
        currentValue: '0',
        unit: '',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error adding goal:', error);
      Alert.alert('Error', 'Failed to add goal');
    }
  };

  const updateGoalProgress = async (goalId, newValue) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ current_value: newValue })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, current_value: newValue }
          : goal
      ));
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  const toggleGoalCompletion = async (goalId) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      const { error } = await supabase
        .from('goals')
        .update({ completed: !goal.completed })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(goals.map(g => 
        g.id === goalId 
          ? { ...g, completed: !g.completed }
          : g
      ));
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      setGoals(goals.filter(g => g.id !== goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const getProgressPercentage = (goal) => {
    if (!goal.target_value || goal.target_value === '0') return 0;
    const current = parseFloat(goal.current_value || 0);
    const target = parseFloat(goal.target_value);
    return Math.min((current / target) * 100, 100);
  };

  const getCategoryColor = (categoryKey) => {
    const category = categories.find(c => c.key === categoryKey);
    return category ? category.color : '#666';
  };

  const getPriorityColor = (priorityKey) => {
    const priority = priorities.find(p => p.key === priorityKey);
    return priority ? priority.color : '#666';
  };

  if (loading) {
    return (
      <View className="bg-primary h-full items-center justify-center">
        <Text className="text-white text-lg">Loading goals...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="bg-primary h-full">
      <View className="flex-row items-center justify-between px-4 pt-5 pb-3">
        <Text className="text-white text-xl font-bold">My Goals</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <MaterialCommunityIcons name="plus-circle" size={30} color="#0B7A75" />
        </TouchableOpacity>
      </View>

      {/* Goal Categories Summary */}
      <View className="px-4 pb-4">
        <Text className="text-white text-lg font-semibold mb-3">Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => {
            const categoryGoals = goals.filter(g => g.category === category.key);
            const completedCount = categoryGoals.filter(g => g.completed).length;
            const totalCount = categoryGoals.length;
            
            return (
              <View key={category.key} className="mr-3 items-center">
                <View 
                  className="w-16 h-16 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: category.color }}
                >
                  <Text className="text-white font-bold text-lg">{totalCount}</Text>
                </View>
                <Text className="text-white text-xs text-center">{category.label}</Text>
                <Text className="text-tertiary text-xs">{completedCount}/{totalCount}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Goals List */}
      <View className="px-4">
        {goals.length === 0 ? (
          <View className="items-center py-10">
            <MaterialCommunityIcons name="target" size={60} color="#666" />
            <Text className="text-gray-400 text-lg mt-4 text-center">
              No goals yet. Start by adding your first goal!
            </Text>
          </View>
        ) : (
          goals.map((goal) => (
            <View key={goal.id} className="bg-gray-800 rounded-lg p-4 mb-3">
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <Chip 
                      mode="outlined" 
                      textStyle={{ color: getCategoryColor(goal.category) }}
                      style={{ borderColor: getCategoryColor(goal.category) }}
                    >
                      {categories.find(c => c.key === goal.category)?.label}
                    </Chip>
                    <View className="ml-2">
                      <Chip 
                        mode="outlined" 
                        textStyle={{ color: getPriorityColor(goal.priority) }}
                        style={{ borderColor: getPriorityColor(goal.priority) }}
                      >
                        {priorities.find(p => p.key === goal.priority)?.label}
                      </Chip>
                    </View>
                  </View>
                  
                  <Text className={`${goal.completed ? 'line-through text-tertiary' : 'text-white'} text-lg font-semibold mb-2`}>
                    {goal.title}
                  </Text>
                  
                  {goal.description && (
                    <Text className="text-gray-300 text-sm mb-2">{goal.description}</Text>
                  )}

                  {goal.target_value && goal.target_value !== '0' && (
                    <View className="mb-3">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-gray-300 text-sm">
                          Progress: {goal.current_value || 0} / {goal.target_value} {goal.unit}
                        </Text>
                        <Text className="text-gray-300 text-sm">
                          {Math.round(getProgressPercentage(goal))}%
                        </Text>
                      </View>
                      <ProgressBar 
                        progress={getProgressPercentage(goal) / 100} 
                        color="#0B7A75"
                        style={{ height: 8, borderRadius: 4 }}
                      />
                    </View>
                  )}

                  {goal.deadline && (
                    <Text className="text-gray-400 text-xs mb-2">
                      Deadline: {dayjs(goal.deadline).format('MMM DD, YYYY')}
                    </Text>
                  )}
                </View>

                <View className="flex-row items-center ml-2">
                  <TouchableOpacity 
                    onPress={() => toggleGoalCompletion(goal.id)}
                    className="mr-2"
                  >
                    <MaterialIcons 
                      name={goal.completed ? "check-circle" : "radio-button-unchecked"} 
                      size={24} 
                      color={goal.completed ? "#4CAF50" : "#EAEAEA"} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteGoal(goal.id)}>
                    <MaterialIcons name="delete" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Progress Update Input */}
              {goal.target_value && goal.target_value !== '0' && !goal.completed && (
                <View className="flex-row items-center mt-3">
                  <TextInput
                    className="flex-1 bg-gray-700 text-white px-3 py-2 rounded mr-2"
                    placeholder="Update progress..."
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={goal.current_value || '0'}
                    onChangeText={(text) => updateGoalProgress(goal.id, text)}
                  />
                  <Text className="text-gray-300 text-sm">{goal.unit}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {/* Add Goal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-gray-800 rounded-lg p-6 w-11/12 max-h-4/5">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-xl font-bold">Add New Goal</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#EAEAEA" />
                </TouchableOpacity>
              </View>

              <TextInput
                className="bg-gray-700 text-white px-3 py-2 rounded mb-3"
                placeholder="Goal title"
                placeholderTextColor="#999"
                value={newGoal.title}
                onChangeText={(text) => setNewGoal({...newGoal, title: text})}
              />

              <TextInput
                className="bg-gray-700 text-white px-3 py-2 rounded mb-3"
                placeholder="Description (optional)"
                placeholderTextColor="#999"
                value={newGoal.description}
                onChangeText={(text) => setNewGoal({...newGoal, description: text})}
                multiline
                numberOfLines={3}
              />

              <View className="mb-3">
                <Text className="text-white text-sm mb-2">Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.key}
                      onPress={() => setNewGoal({...newGoal, category: category.key})}
                      className={`mr-2 px-3 py-2 rounded ${
                        newGoal.category === category.key ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <Text className="text-white">{category.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="mb-3">
                <Text className="text-white text-sm mb-2">Priority</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {priorities.map((priority) => (
                    <TouchableOpacity
                      key={priority.key}
                      onPress={() => setNewGoal({...newGoal, priority: priority.key})}
                      className={`mr-2 px-3 py-2 rounded ${
                        newGoal.priority === priority.key ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <Text className="text-white">{priority.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TextInput
                className="bg-gray-700 text-white px-3 py-2 rounded mb-3"
                placeholder="Deadline (YYYY-MM-DD)"
                placeholderTextColor="#999"
                value={newGoal.deadline}
                onChangeText={(text) => setNewGoal({...newGoal, deadline: text})}
              />

              <View className="flex-row mb-3">
                <TextInput
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded mr-2"
                  placeholder="Target value"
                  placeholderTextColor="#999"
                  value={newGoal.targetValue}
                  onChangeText={(text) => setNewGoal({...newGoal, targetValue: text})}
                  keyboardType="numeric"
                />
                <TextInput
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded"
                  placeholder="Unit (e.g., kg, pages, hours)"
                  placeholderTextColor="#999"
                  value={newGoal.unit}
                  onChangeText={(text) => setNewGoal({...newGoal, unit: text})}
                />
              </View>

              <TouchableOpacity
                className="bg-blue-600 py-3 rounded items-center"
                onPress={addGoal}
              >
                <Text className="text-white font-semibold text-lg">Add Goal</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Goals;
