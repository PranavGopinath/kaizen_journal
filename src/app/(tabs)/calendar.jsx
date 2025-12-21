import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { dateGenerator } from '../../components/calendarDates';
import { months } from '../../components/calendarDates';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from "dayjs";
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Chip, ProgressBar } from 'react-native-paper';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

const Calendar = () => {
  const router = useRouter();
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const currentDate = dayjs();
  const [today, setToday] = useState(currentDate);
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [entries, setEntries] = useState({});
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchMonthEntries();
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchMonthEntries();
      }
    });
  }, [today]);

  const fetchMonthEntries = async () => {
    if (!session?.user) return;
    
    try {
      setLoading(true);
      const startOfMonth = today.startOf('month').format('YYYY-MM-DD');
      const endOfMonth = today.endOf('month').format('YYYY-MM-DD');
      
      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);

      if (error) throw error;

      const entriesMap = {};
      (data || []).forEach(entry => {
        entriesMap[entry.date] = entry;
      });
      setEntries(entriesMap);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setToday(today.subtract(1, 'month'));
    } else {
      setToday(today.add(1, 'month'));
    }
  };

  const goToToday = () => {
    setToday(currentDate);
    setSelectedDate(currentDate);
  };

  const handleDateSelect = (date) => {
    if (!date.currentMonth) return;
    setSelectedDate(date.date);
    
    const dateString = date.date.format('YYYY-MM-DD');
    const entry = entries[dateString];
    
    if (entry) {
      setSelectedEntry(entry);
      setModalVisible(true);
    } else {
      // Navigate to today's entry page to create new entry
      router.push('/today');
    }
  };

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      excellent: '😊',
      good: '🙂',
      neutral: '😐',
      bad: '😔',
      terrible: '😢'
    };
    return moodEmojis[mood] || '';
  };

  const getHabitsProgress = (habits) => {
    if (!habits) return 0;
    const completed = Object.values(habits).filter(Boolean).length;
    const total = Object.keys(habits).length;
    return (completed / total) * 100;
  };

  const getDateStatus = (date) => {
    const dateString = date.date.format('YYYY-MM-DD');
    const entry = entries[dateString];
    
    if (!entry) return 'no-entry';
    
    const habitsProgress = getHabitsProgress(entry.habits);
    if (habitsProgress === 100) return 'excellent';
    if (habitsProgress >= 80) return 'good';
    if (habitsProgress >= 60) return 'neutral';
    if (habitsProgress >= 40) return 'bad';
    return 'terrible';
  };

  const getDateColor = (date) => {
    const status = getDateStatus(date);
    const colors = {
      'no-entry': '#374151',
      'excellent': '#4CAF50',
      'good': '#8BC34A',
      'neutral': '#FFC107',
      'bad': '#FF9800',
      'terrible': '#F44336'
    };
    return colors[status];
  };

  const renderCalendarDay = ({ date, currentMonth, today }, index) => {
    const isSelected = selectedDate && selectedDate.isSame(date.date, 'day');
    const hasEntry = entries[date.date.format('YYYY-MM-DD')];
    const entry = entries[date.date.format('YYYY-MM-DD')];
    
    return (
      <TouchableOpacity
        key={index}
        className={`h-16 w-12 border-t items-center justify-center relative ${
          isSelected ? 'bg-blue-600' : ''
        }`}
        onPress={() => handleDateSelect(date)}
        disabled={!currentMonth}
      >
        <Text 
          className={`${
            currentMonth ? 'text-secondary' : 'text-greyshade'
          } text-lg text-center ${
            today ? 'font-bold' : ''
          }`}
        >
          {date.date.date()}
        </Text>
        
        {/* Entry indicators */}
        {currentMonth && hasEntry && (
          <View className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
            <View 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getDateColor(date) }}
            />
          </View>
        )}
        
        {/* Mood indicator */}
        {currentMonth && entry?.mood && (
          <View className="absolute top-1 right-1">
            <Text className="text-xs">{getMoodEmoji(entry.mood)}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEntryModal = () => {
    if (!selectedEntry) return null;
    
    const habitsProgress = getHabitsProgress(selectedEntry.habits);
    
    return (
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
                <Text className="text-white text-xl font-bold">
                  {dayjs(selectedEntry.date).format('MMMM DD, YYYY')}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#EAEAEA" />
                </TouchableOpacity>
              </View>

              {/* Mood */}
              {selectedEntry.mood && (
                <View className="mb-4">
                  <Text className="text-white font-semibold mb-2">Mood</Text>
                  <View className="flex-row items-center">
                    <Text className="text-3xl mr-3">{getMoodEmoji(selectedEntry.mood)}</Text>
                    <Text className="text-white capitalize">{selectedEntry.mood}</Text>
                  </View>
                </View>
              )}

              {/* Habits Progress */}
              <View className="mb-4">
                <Text className="text-white font-semibold mb-2">Habits Progress</Text>
                <View className="bg-gray-700 rounded-lg p-3">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-white">Overall</Text>
                    <Text className="text-white font-bold">{Math.round(habitsProgress)}%</Text>
                  </View>
                  <ProgressBar 
                    progress={habitsProgress / 100} 
                    color="#0B7A75"
                    style={{ height: 8, borderRadius: 4 }}
                  />
                </View>
                
                <View className="flex-row flex-wrap mt-3">
                  {selectedEntry.habits && Object.entries(selectedEntry.habits).map(([key, value]) => (
                    <Chip 
                      key={key} 
                      className="mr-2 mb-2"
                      textStyle={{ color: value ? '#4CAF50' : '#999' }}
                      style={{ backgroundColor: value ? '#1B5E20' : '#374151' }}
                    >
                      {key}
                    </Chip>
                  ))}
                </View>
              </View>

              {/* Tasks */}
              {selectedEntry.checklist_data && (
                <View className="mb-4">
                  <Text className="text-white font-semibold mb-2">Tasks</Text>
                  <View className="bg-gray-700 rounded-lg p-3">
                    {[1, 2, 3].map((index) => {
                      const task = selectedEntry.checklist_data.listEntries[`listEntry${index}`];
                      const completed = selectedEntry.checklist_data.checkboxes[`checkbox${index}`];
                      if (!task) return null;
                      
                      return (
                        <View key={index} className="flex-row items-center mb-2 last:mb-0">
                          <MaterialIcons
                            name={completed ? "check-circle" : "radio-button-unchecked"}
                            size={20}
                            color={completed ? "#4CAF50" : "#EAEAEA"}
                          />
                          <Text className={`text-white ml-2 ${completed ? 'line-through text-gray-400' : ''}`}>
                            {task}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Gratitude */}
              {selectedEntry.checklist_data && Object.values(selectedEntry.checklist_data.gratitude || {}).some(g => g?.trim()) && (
                <View className="mb-4">
                  <Text className="text-white font-semibold mb-2">Gratitude</Text>
                  <View className="bg-gray-700 rounded-lg p-3">
                    {Object.values(selectedEntry.checklist_data.gratitude || {}).map((gratitude, index) => 
                      gratitude?.trim() ? (
                        <Text key={index} className="text-white mb-1">• {gratitude}</Text>
                      ) : null
                    )}
                  </View>
                </View>
              )}

              {/* Reflection */}
              {selectedEntry.reflection && (
                <View className="mb-4">
                  <Text className="text-white font-semibold mb-2">Reflection</Text>
                  <View className="bg-gray-700 rounded-lg p-3">
                    <Text className="text-white">{selectedEntry.reflection}</Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View className="flex-row space-x-3 mt-4">
                <TouchableOpacity
                  className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
                  onPress={() => {
                    setModalVisible(false);
                    router.push('/today');
                  }}
                >
                  <Text className="text-white font-semibold">Edit Entry</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-1 bg-gray-600 py-3 rounded-lg items-center"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-white font-semibold">Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView>
      <View className="bg-primary w-screen min-h-screen">
        {/* Header */}
        <View className="flex flex-row items-center h-16 pl-7 pr-7 justify-between">
          <View className="flex flex-row items-center">
            <TouchableOpacity onPress={() => navigateMonth('prev')}>
              <MaterialIcons name="navigate-before" size={25} color="#EAEAEA" />
            </TouchableOpacity>
            <Text className="text-secondary font-semibold text-lg mx-4">
              {months[today.month()]} {today.year()}
            </Text>
            <TouchableOpacity onPress={() => navigateMonth('next')}>
              <MaterialIcons name="navigate-next" size={25} color="#EAEAEA" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity onPress={goToToday}>
            <MaterialCommunityIcons name="calendar-today" size={25} color="#0B7A75" />
          </TouchableOpacity>
        </View>

        {/* Legend */}
        <View className="px-7 mb-4">
          <Text className="text-white font-semibold mb-2">Legend</Text>
          <View className="flex-row flex-wrap">
            <View className="flex-row items-center mr-4 mb-2">
              <View className="w-3 h-3 rounded-full bg-gray-500 mr-2" />
              <Text className="text-gray-400 text-sm">No Entry</Text>
            </View>
            <View className="flex-row items-center mr-4 mb-2">
              <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
              <Text className="text-gray-400 text-sm">Excellent Day</Text>
            </View>
            <View className="flex-row items-center mr-4 mb-2">
              <View className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
              <Text className="text-gray-400 text-sm">Good Day</Text>
            </View>
            <View className="flex-row items-center mr-4 mb-2">
              <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
              <Text className="text-gray-400 text-sm">Needs Improvement</Text>
            </View>
          </View>
        </View>

        {/* Day Headers */}
        <View className="flex flex-row text-center justify-center pt-1">
          {days.map((day, index) => (
            <Text key={index} className="text-tertiary text-lg w-12 h-12 font-bold text-center border-t">
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View className="flex flex-wrap flex-row justify-center pl-1 pr-1 items-center">
          {dateGenerator(today.month(), today.year()).map((date, index) => 
            renderCalendarDay(date, index)
          )}
        </View>

        {/* Quick Stats */}
        <View className="px-7 py-6">
          <Text className="text-white font-semibold text-lg mb-3">Month Overview</Text>
          <View className="bg-gray-800 rounded-lg p-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white">Entries This Month</Text>
              <Text className="text-white font-bold">{Object.keys(entries).length}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white">Days with Full Habits</Text>
              <Text className="text-white font-bold">
                {Object.values(entries).filter(entry => getHabitsProgress(entry.habits) === 100).length}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-white">Average Mood</Text>
              <Text className="text-white font-bold">
                {(() => {
                  const moodEntries = Object.values(entries).filter(entry => entry.mood);
                  if (moodEntries.length === 0) return 'N/A';
                  
                  const moodScores = { excellent: 5, good: 4, neutral: 3, bad: 2, terrible: 1 };
                  const avgScore = moodEntries.reduce((sum, entry) => sum + moodScores[entry.mood], 0) / moodEntries.length;
                  const avgMood = Object.keys(moodScores).find(key => moodScores[key] === Math.round(avgScore));
                  return avgMood ? getMoodEmoji(avgMood) : 'N/A';
                })()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {renderEntryModal()}
    </ScrollView>
  );
};

export default Calendar;
