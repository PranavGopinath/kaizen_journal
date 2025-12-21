import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { Card, Divider, List, ProgressBar } from 'react-native-paper';
import { supabase } from '../../lib/supabase';
import dayjs from 'dayjs';

const Profile = () => {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalGoals: 0,
    completedGoals: 0,
    streakDays: 0,
    averageMood: 0
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [reminders, setReminders] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserProfile();
        fetchUserStats();
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile();
        fetchUserStats();
      }
    });
  }, []);

  const fetchUserProfile = async () => {
    if (!session?.user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserStats = async () => {
    if (!session?.user) return;
    
    try {
      setLoading(true);
      
      // Fetch total entries
      const { data: entries, error: entriesError } = await supabase
        .from('daily_entries')
        .select('date, mood, habits')
        .eq('user_id', session.user.id);

      if (entriesError) throw entriesError;

      // Fetch total goals
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('completed')
        .eq('user_id', session.user.id);

      if (goalsError) throw goalsError;

      // Calculate stats
      const totalEntries = entries?.length || 0;
      const totalGoals = goals?.length || 0;
      const completedGoals = goals?.filter(g => g.completed).length || 0;
      
      // Calculate streak
      const sortedEntries = entries?.sort((a, b) => dayjs(b.date).diff(dayjs(a.date))) || [];
      let streakDays = 0;
      let currentDate = dayjs();
      
      for (let i = 0; i < sortedEntries.length; i++) {
        const entryDate = dayjs(sortedEntries[i].date);
        if (currentDate.diff(entryDate, 'day') === streakDays) {
          streakDays++;
        } else {
          break;
        }
      }

      // Calculate average mood
      const moodEntries = entries?.filter(e => e.mood) || [];
      const moodScores = { excellent: 5, good: 4, neutral: 3, bad: 2, terrible: 1 };
      const averageMood = moodEntries.length > 0 
        ? moodEntries.reduce((sum, entry) => sum + moodScores[entry.mood], 0) / moodEntries.length
        : 0;

      setStats({
        totalEntries,
        totalGoals,
        completedGoals,
        streakDays,
        averageMood: Math.round(averageMood * 10) / 10
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  const getMoodEmoji = (moodScore) => {
    if (moodScore >= 4.5) return '😊';
    if (moodScore >= 3.5) return '🙂';
    if (moodScore >= 2.5) return '😐';
    if (moodScore >= 1.5) return '😔';
    return '😢';
  };

  const getMoodLabel = (moodScore) => {
    if (moodScore >= 4.5) return 'Excellent';
    if (moodScore >= 3.5) return 'Good';
    if (moodScore >= 2.5) return 'Neutral';
    if (moodScore >= 1.5) return 'Below Average';
    return 'Poor';
  };

  if (loading) {
    return (
      <View className="bg-primary h-full items-center justify-center">
        <Text className="text-white text-lg">Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="bg-primary min-h-screen">
      <View className="p-4">
        {/* User Header */}
        <Card className="bg-gray-800 mb-6">
          <Card.Content className="items-center py-6">
            <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-4">
              <MaterialCommunityIcons name="account" size={40} color="#EAEAEA" />
            </View>
            <Text className="text-white text-xl font-bold mb-2">
              {userProfile?.full_name || session?.user?.email || 'User'}
            </Text>
            <Text className="text-gray-400 text-sm mb-4">
              Member since {dayjs(session?.user?.created_at).format('MMMM YYYY')}
            </Text>
            <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-lg">
              <Text className="text-white font-semibold">Edit Profile</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Statistics */}
        <View className="mb-6">
          <Text className="text-white text-lg font-bold mb-4">Your Progress</Text>
          <View className="flex-row flex-wrap justify-between">
            <Card className="bg-gray-800 w-[48%] mb-3">
              <Card.Content className="items-center py-4">
                <MaterialCommunityIcons name="book-open" size={30} color="#0B7A75" />
                <Text className="text-white text-2xl font-bold mt-2">{stats.totalEntries}</Text>
                <Text className="text-gray-400 text-sm">Journal Entries</Text>
              </Card.Content>
            </Card>

            <Card className="bg-gray-800 w-[48%] mb-3">
              <Card.Content className="items-center py-4">
                <Feather name="target" size={30} color="#0B7A75" />
                <Text className="text-white text-2xl font-bold mt-2">{stats.completedGoals}</Text>
                <Text className="text-gray-400 text-sm">Goals Completed</Text>
              </Card.Content>
            </Card>

            <Card className="bg-gray-800 w-[48%] mb-3">
              <Card.Content className="items-center py-4">
                <MaterialIcons name="local-fire-department" size={30} color="#FF9800" />
                <Text className="text-white text-2xl font-bold mt-2">{stats.streakDays}</Text>
                <Text className="text-gray-400 text-sm">Day Streak</Text>
              </Card.Content>
            </Card>

            <Card className="bg-gray-800 w-[48%] mb-3">
              <Card.Content className="items-center py-4">
                <Text className="text-3xl">{getMoodEmoji(stats.averageMood)}</Text>
                <Text className="text-white text-lg font-bold mt-2">{stats.averageMood}</Text>
                <Text className="text-gray-400 text-sm">Avg Mood</Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Goal Progress */}
        {stats.totalGoals > 0 && (
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-4">Goal Completion</Text>
            <Card className="bg-gray-800">
              <Card.Content className="py-4">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-white">Overall Progress</Text>
                  <Text className="text-white font-bold">
                    {Math.round((stats.completedGoals / stats.totalGoals) * 100)}%
                  </Text>
                </View>
                <ProgressBar 
                  progress={stats.totalGoals > 0 ? stats.completedGoals / stats.totalGoals : 0} 
                  color="#0B7A75"
                  style={{ height: 8, borderRadius: 4 }}
                />
                <Text className="text-gray-400 text-sm mt-2 text-center">
                  {stats.completedGoals} of {stats.totalGoals} goals completed
                </Text>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Settings */}
        <View className="mb-6">
          <Text className="text-white text-lg font-bold mb-4">Settings</Text>
          <Card className="bg-gray-800">
            <Card.Content className="p-0">
              <List.Item
                title="Notifications"
                description="Daily reminders to journal"
                left={(props) => <List.Icon {...props} icon="bell" color="#0B7A75" />}
                right={() => (
                  <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                    trackColor={{ false: '#767577', true: '#0B7A75' }}
                    thumbColor={notifications ? '#EAEAEA' : '#f4f3f4'}
                  />
                )}
                titleStyle={{ color: '#EAEAEA' }}
                descriptionStyle={{ color: '#999' }}
              />
              <Divider className="bg-gray-600" />
              <List.Item
                title="Dark Mode"
                description="Use dark theme"
                left={(props) => <List.Icon {...props} icon="theme-light-dark" color="#0B7A75" />}
                right={() => (
                  <Switch
                    value={darkMode}
                    onValueChange={setDarkMode}
                    trackColor={{ false: '#767577', true: '#0B7A75' }}
                    thumbColor={darkMode ? '#EAEAEA' : '#f4f3f4'}
                  />
                )}
                titleStyle={{ color: '#EAEAEA' }}
                descriptionStyle={{ color: '#999' }}
              />
              <Divider className="bg-gray-600" />
              <List.Item
                title="Daily Reminders"
                description="Remind me to complete habits"
                left={(props) => <List.Icon {...props} icon="clock" color="#0B7A75" />}
                right={() => (
                  <Switch
                    value={reminders}
                    onValueChange={setReminders}
                    trackColor={{ false: '#767577', true: '#0B7A75' }}
                    thumbColor={reminders ? '#EAEAEA' : '#f4f3f4'}
                  />
                )}
                titleStyle={{ color: '#EAEAEA' }}
                descriptionStyle={{ color: '#999' }}
              />
            </Card.Content>
          </Card>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-white text-lg font-bold mb-4">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity className="bg-gray-800 w-[48%] mb-3 p-4 rounded-lg items-center">
              <MaterialIcons name="backup" size={30} color="#0B7A75" />
              <Text className="text-white font-semibold mt-2">Export Data</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-800 w-[48%] mb-3 p-4 rounded-lg items-center">
              <MaterialIcons name="help" size={30} color="#0B7A75" />
              <Text className="text-white font-semibold mt-2">Help & Support</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-800 w-[48%] mb-3 p-4 rounded-lg items-center">
              <MaterialIcons name="privacy-tip" size={30} color="#0B7A75" />
              <Text className="text-white font-semibold mt-2">Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-800 w-[48%] mb-3 p-4 rounded-lg items-center">
              <MaterialIcons name="info" size={30} color="#0B7A75" />
              <Text className="text-white font-semibold mt-2">About</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          className="bg-red-600 py-4 rounded-lg items-center mb-6"
          onPress={signOut}
        >
          <Text className="text-white font-semibold text-lg">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Profile;
