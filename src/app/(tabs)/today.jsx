import { View, Text, ScrollView, Button, Switch, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { months } from '../../components/calendarDates';
import dayjs from 'dayjs';
import Header from '../../components/Header';
import CheckBox from '../../components/CheckBox';
import { supabase } from '../../lib/supabase';
import { TextInput, ToggleButton, Chip, ProgressBar } from 'react-native-paper';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const Today = () => {
  const currentDate = dayjs();
  const [editMode, setEditMode] = useState(false);
  const [checklistData, setChecklistData] = useState({
    checkboxes: { checkbox1: false, checkbox2: false, checkbox3: false },
    listEntries: { listEntry1: '', listEntry2: '', listEntry3: '' },
    gratitude: { gratitude1: '', gratitude2: '', gratitude3: '' },
  });
  const [reflection, setReflection] = useState('');
  const [mood, setMood] = useState(null);
  const [habits, setHabits] = useState({
    exercise: false,
    meditation: false,
    reading: false,
    water: false,
    sleep: false
  });
  const [fetchError, setFetchError] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const moods = [
    { key: 'excellent', label: '😊', color: '#4CAF50' },
    { key: 'good', label: '🙂', color: '#8BC34A' },
    { key: 'neutral', label: '😐', color: '#FFC107' },
    { key: 'bad', label: '😔', color: '#FF9800' },
    { key: 'terrible', label: '😢', color: '#F44336' }
  ];

  const habitLabels = {
    exercise: 'Exercise',
    meditation: 'Meditation',
    reading: 'Reading',
    water: 'Drink Water',
    sleep: 'Good Sleep'
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchTodayEntry();
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchTodayEntry();
      }
    });
  }, []);

  const fetchTodayEntry = async () => {
    if (!session?.user) return;
    
    try {
      const today = currentDate.format('YYYY-MM-DD');
      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching entry:', error);
        return;
      }

      if (data) {
        setChecklistData(data.checklist_data || checklistData);
        setReflection(data.reflection || '');
        setMood(data.mood || null);
        setHabits(data.habits || habits);
        setSaved(true);
      }
    } catch (error) {
      console.error('Error fetching entry:', error);
    }
  };

  const saveEntry = async () => {
    if (!session?.user) return;
    
    setLoading(true);
    try {
      const today = currentDate.format('YYYY-MM-DD');
      const entryData = {
        user_id: session.user.id,
        date: today,
        checklist_data: checklistData,
        reflection: reflection,
        mood: mood,
        habits: habits,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('daily_entries')
        .upsert(entryData, { onConflict: 'user_id,date' });

      if (error) throw error;

      setSaved(true);
      Alert.alert('Success', 'Your journal entry has been saved!');
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, key, value) => {
    if (!editMode) return;
    setChecklistData((prevChecklistData) => ({
      ...prevChecklistData,
      [section]: {
        ...prevChecklistData[section],
        [key]: value,
      },
    }));
    setSaved(false);
  };

  const toggleEdit = () => {
    setEditMode(!editMode);
    if (editMode && !saved) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save them?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save', onPress: saveEntry }
        ]
      );
    }
  };

  const handleMoodSelect = (moodKey) => {
    setMood(moodKey);
    setSaved(false);
  };

  const toggleHabit = (habitKey) => {
    if (!editMode) return;
    setHabits(prev => ({
      ...prev,
      [habitKey]: !prev[habitKey]
    }));
    setSaved(false);
  };

  const getMoodColor = (moodKey) => {
    const selectedMood = moods.find(m => m.key === moodKey);
    return selectedMood ? selectedMood.color : '#666';
  };

  const getHabitsProgress = () => {
    const completed = Object.values(habits).filter(Boolean).length;
    const total = Object.keys(habits).length;
    return (completed / total) * 100;
  };

  return (
    <ScrollView className="bg-primary min-h-screen">
      <View className="bg-primary w-full p-4">
        {/* Header with Date and Edit Toggle */}
        <View className="flex items-center mb-6">
          <Text className="text-secondary font-bold text-xl mb-2">
            {months[currentDate.month()]} {currentDate.date()}, {currentDate.year()}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-white text-sm mr-3">Edit Mode</Text>
            <Switch
              trackColor={'#eaeaea'}
              thumbColor={editMode ? '#0b7a75' : '#7d8491'}
              onValueChange={toggleEdit}
              value={editMode}
            />
          </View>
        </View>

        {/* Mood Tracker */}
        <View className="mb-6">
          <Header heading="How are you feeling today?" />
          <View className="flex-row justify-center mt-3">
            {moods.map((moodItem) => (
              <TouchableOpacity
                key={moodItem.key}
                onPress={() => handleMoodSelect(moodItem.key)}
                className={`mx-2 p-3 rounded-full ${
                  mood === moodItem.key ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                <Text className="text-2xl">{moodItem.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {mood && (
            <Text className="text-center text-white mt-2">
              Selected: {moods.find(m => m.key === mood)?.label}
            </Text>
          )}
        </View>

        {/* Habits Tracker */}
        <View className="mb-6">
          <Header heading="Daily Habits" />
          <View className="bg-gray-800 rounded-lg p-4 mb-3">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white font-semibold">Progress</Text>
              <Text className="text-white">{Math.round(getHabitsProgress())}%</Text>
            </View>
            <ProgressBar 
              progress={getHabitsProgress() / 100} 
              color="#0B7A75"
              style={{ height: 8, borderRadius: 4 }}
            />
          </View>
          <View className="flex-row flex-wrap justify-between">
            {Object.entries(habits).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                onPress={() => toggleHabit(key)}
                disabled={!editMode}
                className={`w-[48%] mb-3 p-3 rounded-lg border-2 ${
                  value ? 'border-green-500 bg-green-900' : 'border-gray-600 bg-gray-800'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-white font-medium">{habitLabels[key]}</Text>
                  <MaterialIcons
                    name={value ? "check-circle" : "radio-button-unchecked"}
                    size={20}
                    color={value ? "#4CAF50" : "#EAEAEA"}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Checklist */}
        <View className="mb-6">
          <Header heading="Today's Tasks" />
          <View className="bg-gray-800 rounded-lg p-4">
            {[1, 2, 3].map((index) => (
              <View key={index} className="flex-row items-center mb-3 last:mb-0">
                <CheckBox
                  className='w-10'
                  isChecked={checklistData.checkboxes[`checkbox${index}`]}
                  onPress={() =>
                    handleChange('checkboxes', `checkbox${index}`, !checklistData.checkboxes[`checkbox${index}`])
                  }
                  disabled={!editMode}
                />
                <TextInput
                  className="flex-1 ml-2"
                  label="Task"
                  mode="outlined"
                  value={checklistData.listEntries[`listEntry${index}`]}
                  placeholder="What do you want to accomplish today?"
                  onChangeText={(text) => handleChange('listEntries', `listEntry${index}`, text)}
                  disabled={!editMode}
                  theme={{ colors: { primary: '#0B7A75', background: '#374151' } }}
                  style={{ backgroundColor: '#374151' }}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Gratitude */}
        <View className="mb-6">
          <Header heading="Gratitude Journal" />
          <View className="bg-gray-800 rounded-lg p-4">
            {[1, 2, 3].map((index) => (
              <TextInput
                key={index}
                className="mb-3 last:mb-0"
                value={checklistData.gratitude[`gratitude${index}`]}
                mode="outlined"
                placeholder={`I'm grateful for... (${index})`}
                onChangeText={(text) => handleChange('gratitude', `gratitude${index}`, text)}
                disabled={!editMode}
                multiline
                numberOfLines={2}
                theme={{ colors: { primary: '#0B7A75', background: '#374151' } }}
                style={{ backgroundColor: '#374151' }}
              />
            ))}
          </View>
        </View>

        {/* Reflection */}
        <View className="mb-6">
          <Header heading="Daily Reflection" />
          <View className="bg-gray-800 rounded-lg p-4">
            <TextInput
              className="w-full"
              value={reflection}
              mode="outlined"
              placeholder="How was your day? What did you learn? What could you improve?"
              onChangeText={(text) => {
                setReflection(text);
                setSaved(false);
              }}
              disabled={!editMode}
              multiline
              numberOfLines={4}
              theme={{ colors: { primary: '#0B7A75', background: '#374151' } }}
              style={{ backgroundColor: '#374151' }}
            />
          </View>
        </View>

        {/* Save Button */}
        {editMode && (
          <View className="mb-6">
            <TouchableOpacity
              className={`py-4 rounded-lg items-center ${
                saved ? 'bg-green-600' : 'bg-blue-600'
              }`}
              onPress={saveEntry}
              disabled={loading}
            >
              <Text className="text-white font-semibold text-lg">
                {loading ? 'Saving...' : saved ? '✓ Saved' : 'Save Entry'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Stats */}
        <View className="mb-6">
          <Header heading="Today's Summary" />
          <View className="bg-gray-800 rounded-lg p-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white">Tasks Completed</Text>
              <Text className="text-white font-bold">
                {Object.values(checklistData.checkboxes).filter(Boolean).length}/3
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white">Habits Tracked</Text>
              <Text className="text-white font-bold">
                {Object.values(habits).filter(Boolean).length}/5
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-white">Gratitude Entries</Text>
              <Text className="text-white font-bold">
                {Object.values(checklistData.gratitude).filter(text => text.trim()).length}/3
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Today;
