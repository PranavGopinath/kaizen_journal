import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import Auth from '../app/(auth)/Auth'
import {Session} from '@supabase/supabase-js'

export default function App() {
  console.log(supabase);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null)


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])


  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={{ height: '100%' }}>
        <View>
          <Image
            source={require("../../assets/images/logo.png")}
          />
           <Auth />
           {session && session.user && <Text>{session.user.id}</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
