import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { Card, Chip, Searchbar } from 'react-native-paper';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';

const SearchIndex = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [session, setSession] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [recentGoals, setRecentGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchCategories = [
    {
      key: 'entries',
      title: 'Journal Entries',
      description: 'Search through your daily reflections and gratitude',
      icon: 'book-open',
      color: '#4ECDC4',
      route: '/search/entries'
    },
    {
      key: 'goals',
      title: 'Goals & Objectives',
      description: 'Find specific goals and track progress',
      icon: 'target',
      color: '#FF6B6B',
      route: '/search/goals'
    },
    {
      key: 'mood',
      title: 'Mood Tracking',
      description: 'Search by mood patterns and emotional states',
      icon: 'heart',
      color: '#FFE66D',
      route: '/search/mood'
    },
    {
      key: 'habits',
      title: 'Habit Tracking',
      description: 'Find days with specific habit completions',
      icon: 'check-circle',
      color: '#95E1D3',
      route: '/search/habits'
    }
  ];

  const quickSearches = [
    'grateful',
    'exercise',
    'meditation',
    'workout',
    'reading',
    'learning',
    'family',
    'friends',
    'work',
    'stress',
    'happy',
    'productive'
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchRecentContent();
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchRecentContent();
      }
    });
  }, []);

  const fetchRecentContent = async () => {
    if (!session?.user) return;
    
    try {
      setLoading(true);
      
      // Fetch recent entries
      const { data: entries, error: entriesError } = await supabase
        .from('daily_entries')
        .select('date, reflection, mood')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false })
        .limit(5);

      if (!entriesError) {
        setRecentEntries(entries || []);
      }

      // Fetch recent goals
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('title, category, completed')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!goalsError) {
        setRecentGoals(goals || []);
      }
    } catch (error) {
      console.error('Error fetching recent content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleQuickSearch = (term) => {
    router.push(`/search/${encodeURIComponent(term)}`);
  };

  const handleCategorySearch = (category) => {
    router.push(category.route);
  };

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      excellent: '😊',
      good: '🙂',
      neutral: '😐',
      bad: '😔',
      terrible: '😢'
    };
    return moodEmojis[mood] || '😐';
  };

  const getGoalStatusIcon = (completed) => {
    return completed ? 'check-circle' : 'radio-button-unchecked';
  };

  const getGoalStatusColor = (completed) => {
    return completed ? '#4CAF50' : '#EAEAEA';
  };

  return (
    <View className="bg-primary min-h-screen">
      {/* Header */}
      <View className="bg-gray-800 p-4 pt-12">
        <Text className="text-white text-2xl font-bold mb-2">Search Journal</Text>
        <Text className="text-gray-400 text-sm">
          Find insights in your journal entries, goals, and habits
        </Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Search Bar */}
        <View className="my-6">
          <Searchbar
            placeholder="Search entries, goals, reflections..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            onSubmitEditing={handleSearch}
            className="bg-gray-700"
            iconColor="#EAEAEA"
            inputStyle={{ color: '#EAEAEA' }}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            className="bg-blue-600 py-3 rounded-lg items-center mt-3"
            onPress={handleSearch}
          >
            <Text className="text-white font-semibold text-lg">Search</Text>
          </TouchableOpacity>
        </View>

        {/* Search Categories */}
        <View className="mb-6">
          <Text className="text-white text-lg font-bold mb-4">Search by Category</Text>
          <View className="space-y-3">
            {searchCategories.map((category) => (
              <TouchableOpacity
                key={category.key}
                onPress={() => handleCategorySearch(category)}
                className="bg-gray-800 rounded-lg p-4"
              >
                <View className="flex-row items-center">
                  <View 
                    className="w-12 h-12 rounded-lg items-center justify-center mr-4"
                    style={{ backgroundColor: category.color }}
                  >
                    <Feather name={category.icon} size={24} color="#1f1f1f" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-lg">{category.title}</Text>
                    <Text className="text-gray-400 text-sm">{category.description}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#666" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Searches */}
        <View className="mb-6">
          <Text className="text-white text-lg font-bold mb-4">Quick Searches</Text>
          <View className="flex-row flex-wrap">
            {quickSearches.map((term) => (
              <TouchableOpacity
                key={term}
                onPress={() => handleQuickSearch(term)}
                className="bg-gray-700 px-3 py-2 rounded-full mr-2 mb-2"
              >
                <Text className="text-white text-sm">{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Entries */}
        {recentEntries.length > 0 && (
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-4">Recent Entries</Text>
            <View className="space-y-3">
              {recentEntries.map((entry, index) => (
                <Card key={index} className="bg-gray-800">
                  <Card.Content className="py-3">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-white font-semibold">
                        {dayjs(entry.date).format('MMM DD, YYYY')}
                      </Text>
                      {entry.mood && (
                        <Text className="text-2xl">{getMoodEmoji(entry.mood)}</Text>
                      )}
                    </View>
                    {entry.reflection && (
                      <Text className="text-gray-300 text-sm" numberOfLines={2}>
                        {entry.reflection}
                      </Text>
                    )}
                  </Card.Content>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Recent Goals */}
        {recentGoals.length > 0 && (
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-4">Recent Goals</Text>
            <View className="space-y-3">
              {recentGoals.map((goal, index) => (
                <Card key={index} className="bg-gray-800">
                  <Card.Content className="py-3">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-white font-semibold flex-1 mr-3">
                        {goal.title}
                      </Text>
                      <MaterialIcons 
                        name={getGoalStatusIcon(goal.completed)} 
                        size={20} 
                        color={getGoalStatusColor(goal.completed)} 
                      />
                    </View>
                    <View className="flex-row items-center">
                      <Chip 
                        mode="outlined" 
                        textStyle={{ color: '#FF6B6B' }}
                        style={{ borderColor: '#FF6B6B' }}
                      >
                        {goal.category}
                      </Chip>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Search Tips */}
        <View className="mb-6">
          <Text className="text-white text-lg font-bold mb-4">Search Tips</Text>
          <Card className="bg-gray-800">
            <Card.Content className="py-4">
              <View className="space-y-3">
                <View className="flex-row items-start">
                  <MaterialIcons name="lightbulb" size={20} color="#FFD700" className="mr-3 mt-1" />
                  <Text className="text-white text-sm flex-1">
                    Use specific keywords like "grateful", "exercise", or "meditation" to find related entries
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <MaterialIcons name="lightbulb" size={20} color="#FFD700" className="mr-3 mt-1" />
                  <Text className="text-white text-sm flex-1">
                    Search by mood to find patterns in your emotional states
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <MaterialIcons name="lightbulb" size={20} color="#FFD700" className="mr-3 mt-1" />
                  <Text className="text-white text-sm flex-1">
                    Use date filters to find entries from specific time periods
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <MaterialIcons name="lightbulb" size={20} color="#FFD700" className="mr-3 mt-1" />
                  <Text className="text-white text-sm flex-1">
                    Combine multiple search terms for more specific results
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

export default SearchIndex; 