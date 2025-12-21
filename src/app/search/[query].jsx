import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { Chip, Divider, Card, Searchbar } from 'react-native-paper';
import { supabase } from '../../lib/supabase';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';

const Search = () => {
  const { query: initialQuery } = useLocalSearchParams();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    entries: true,
    goals: true,
    mood: false,
    habits: false
  });
  const [dateRange, setDateRange] = useState('all'); // all, week, month, year
  const [sortBy, setSortBy] = useState('relevance'); // relevance, date, mood

  const searchFilters = [
    { key: 'entries', label: 'Journal Entries', icon: 'book-open' },
    { key: 'goals', label: 'Goals', icon: 'target' },
    { key: 'mood', label: 'Mood', icon: 'heart' },
    { key: 'habits', label: 'Habits', icon: 'check-circle' }
  ];

  const dateFilters = [
    { key: 'all', label: 'All Time' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' }
  ];

  const sortOptions = [
    { key: 'relevance', label: 'Relevance' },
    { key: 'date', label: 'Date' },
    { key: 'mood', label: 'Mood' }
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && searchQuery) {
        performSearch();
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && searchQuery) {
        performSearch();
      }
    });
  }, []);

  useEffect(() => {
    if (searchQuery && session) {
      performSearch();
    }
  }, [searchQuery, activeFilters, dateRange, sortBy]);

  const performSearch = async () => {
    if (!searchQuery.trim() || !session?.user) return;

    setLoading(true);
    try {
      let results = [];

      // Search in journal entries
      if (activeFilters.entries) {
        const entriesResults = await searchEntries();
        results.push(...entriesResults.map(item => ({ ...item, type: 'entry' })));
      }

      // Search in goals
      if (activeFilters.goals) {
        const goalsResults = await searchGoals();
        results.push(...goalsResults.map(item => ({ ...item, type: 'goal' })));
      }

      // Apply date filtering
      if (dateRange !== 'all') {
        results = filterByDateRange(results);
      }

      // Apply sorting
      results = sortResults(results);

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchEntries = async () => {
    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .or(`reflection.ilike.%${searchQuery}%,gratitude1.ilike.%${searchQuery}%,gratitude2.ilike.%${searchQuery}%,gratitude3.ilike.%${searchQuery}%`);

    if (error) throw error;
    return data || [];
  };

  const searchGoals = async () => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', session.user.id)
      .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);

    if (error) throw error;
    return data || [];
  };

  const filterByDateRange = (results) => {
    const now = dayjs();
    let startDate;

    switch (dateRange) {
      case 'week':
        startDate = now.startOf('week');
        break;
      case 'month':
        startDate = now.startOf('month');
        break;
      case 'year':
        startDate = now.startOf('year');
        break;
      default:
        return results;
    }

    return results.filter(item => {
      const itemDate = dayjs(item.created_at || item.date);
      return itemDate.isAfter(startDate);
    });
  };

  const sortResults = (results) => {
    switch (sortBy) {
      case 'date':
        return results.sort((a, b) => {
          const dateA = dayjs(a.created_at || a.date);
          const dateB = dayjs(b.created_at || b.date);
          return dateB.diff(dateA);
        });
      case 'mood':
        return results.sort((a, b) => {
          if (a.type === 'entry' && b.type === 'entry') {
            const moodOrder = { excellent: 5, good: 4, neutral: 3, bad: 2, terrible: 1 };
            return (moodOrder[b.mood] || 0) - (moodOrder[a.mood] || 0);
          }
          return 0;
        });
      default: // relevance
        return results.sort((a, b) => {
          // Simple relevance scoring based on text length and type
          const scoreA = getRelevanceScore(a);
          const scoreB = getRelevanceScore(b);
          return scoreB - scoreA;
        });
    }
  };

  const getRelevanceScore = (item) => {
    let score = 0;
    if (item.type === 'entry') {
      score += (item.reflection?.length || 0) * 0.1;
      score += (item.gratitude1?.length || 0) * 0.05;
      score += (item.gratitude2?.length || 0) * 0.05;
      score += (item.gratitude3?.length || 0) * 0.05;
    } else if (item.type === 'goal') {
      score += (item.title?.length || 0) * 0.2;
      score += (item.description?.length || 0) * 0.1;
    }
    return score;
  };

  const toggleFilter = (filterKey) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
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

  const renderSearchResult = ({ item }) => {
    if (item.type === 'entry') {
      return (
        <Card className="mb-3 bg-gray-800">
          <Card.Content>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white font-semibold text-lg">Journal Entry</Text>
              <View className="flex-row items-center">
                {item.mood && (
                  <Text className="text-2xl mr-2">{getMoodEmoji(item.mood)}</Text>
                )}
                <Text className="text-gray-400 text-sm">
                  {dayjs(item.date).format('MMM DD, YYYY')}
                </Text>
              </View>
            </View>
            
            {item.reflection && (
              <View className="mb-2">
                <Text className="text-gray-300 text-sm font-medium mb-1">Reflection:</Text>
                <Text className="text-white">{item.reflection}</Text>
              </View>
            )}

            {Object.values(item.gratitude || {}).some(g => g?.trim()) && (
              <View className="mb-2">
                <Text className="text-gray-300 text-sm font-medium mb-1">Gratitude:</Text>
                {Object.values(item.gratitude || {}).map((gratitude, index) => 
                  gratitude?.trim() ? (
                    <Text key={index} className="text-white">• {gratitude}</Text>
                  ) : null
                )}
              </View>
            )}

            <View className="flex-row flex-wrap mt-2">
              {item.habits && Object.entries(item.habits).map(([key, value]) => 
                value ? (
                  <Chip key={key} className="mr-2 mb-1" textStyle={{ color: '#4CAF50' }}>
                    {key}
                  </Chip>
                ) : null
              )}
            </View>
          </Card.Content>
        </Card>
      );
    } else if (item.type === 'goal') {
      return (
        <Card className="mb-3 bg-gray-800">
          <Card.Content>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white font-semibold text-lg">Goal</Text>
              <MaterialIcons 
                name={getGoalStatusIcon(item.completed)} 
                size={20} 
                color={getGoalStatusColor(item.completed)} 
              />
            </View>
            
            <Text className="text-white text-lg mb-2">{item.title}</Text>
            
            {item.description && (
              <Text className="text-gray-300 mb-2">{item.description}</Text>
            )}

            <View className="flex-row flex-wrap">
              <Chip className="mr-2 mb-1" textStyle={{ color: '#FF6B6B' }}>
                {item.category}
              </Chip>
              <Chip className="mr-2 mb-1" textStyle={{ color: '#FF9800' }}>
                {item.priority}
              </Chip>
              {item.deadline && (
                <Chip className="mr-2 mb-1" textStyle={{ color: '#4ECDC4' }}>
                  {dayjs(item.deadline).format('MMM DD')}
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>
      );
    }
    return null;
  };

  return (
    <View className="bg-primary min-h-screen">
      {/* Search Header */}
      <View className="bg-gray-800 p-4 pt-12">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <MaterialIcons name="arrow-back" size={24} color="#EAEAEA" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Search Journal</Text>
        </View>
        
        <Searchbar
          placeholder="Search entries, goals, reflections..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          className="bg-gray-700"
          iconColor="#EAEAEA"
          inputStyle={{ color: '#EAEAEA' }}
          placeholderTextColor="#999"
        />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-3">
        <Text className="text-white font-medium mr-3 self-center">Filters:</Text>
        {searchFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => toggleFilter(filter.key)}
            className={`mr-2 px-3 py-2 rounded-full border-2 ${
              activeFilters[filter.key] 
                ? 'border-blue-500 bg-blue-600' 
                : 'border-gray-600 bg-gray-700'
            }`}
          >
            <View className="flex-row items-center">
              <Feather name={filter.icon} size={16} color="#EAEAEA" className="mr-1" />
              <Text className="text-white text-sm ml-1">{filter.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Date Range Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 pb-3">
        <Text className="text-white font-medium mr-3 self-center">Time:</Text>
        {dateFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => setDateRange(filter.key)}
            className={`mr-2 px-3 py-2 rounded-full border-2 ${
              dateRange === filter.key 
                ? 'border-green-500 bg-green-600' 
                : 'border-gray-600 bg-gray-700'
            }`}
          >
            <Text className="text-white text-sm">{filter.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 pb-3">
        <Text className="text-white font-medium mr-3 self-center">Sort by:</Text>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            onPress={() => setSortBy(option.key)}
            className={`mr-2 px-3 py-2 rounded-full border-2 ${
              sortBy === option.key 
                ? 'border-purple-500 bg-purple-600' 
                : 'border-gray-600 bg-gray-700'
            }`}
          >
            <Text className="text-white text-sm">{option.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Divider className="bg-gray-600" />

      {/* Search Results */}
      <View className="flex-1 px-4 pt-4">
        {loading ? (
          <View className="items-center py-10">
            <Text className="text-white text-lg">Searching...</Text>
          </View>
        ) : searchQuery.trim() === '' ? (
          <View className="items-center py-10">
            <Feather name="search" size={60} color="#666" />
            <Text className="text-gray-400 text-lg mt-4 text-center">
              Start typing to search your journal
            </Text>
            <Text className="text-gray-500 text-sm mt-2 text-center">
              Search through entries, goals, and reflections
            </Text>
          </View>
        ) : searchResults.length === 0 ? (
          <View className="items-center py-10">
            <Feather name="inbox" size={60} color="#666" />
            <Text className="text-gray-400 text-lg mt-4 text-center">
              No results found for "{searchQuery}"
            </Text>
            <Text className="text-gray-500 text-sm mt-2 text-center">
              Try adjusting your search terms or filters
            </Text>
          </View>
        ) : (
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white font-semibold">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </Text>
              <Text className="text-gray-400 text-sm">
                for "{searchQuery}"
              </Text>
            </View>
            
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item, index) => `${item.type}-${item.id || index}`}
              showsVerticalScrollIndicator={false}
              className="flex-1"
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default Search;