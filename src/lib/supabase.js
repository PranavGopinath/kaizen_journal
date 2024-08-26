import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native'

const supabaseUrl = 'https://hfduvxvaxrjaokboinjq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZHV2eHZheHJqYW9rYm9pbmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQzNjY2MDEsImV4cCI6MjAzOTk0MjYwMX0._vClK4qppRgiYBwIOokYMfZ6ITUpecc5jXFOqFjBVpU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})