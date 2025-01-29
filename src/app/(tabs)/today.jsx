  import { View, Text, ScrollView, Button, Switch } from 'react-native';
  import React, { useState, useEffect } from 'react';
  import { months } from '../../components/calendarDates';
  import dayjs from 'dayjs';
  import Header from '../../components/Header';
  import CheckBox from '../../components/CheckBox';
  import { supabase } from '../../lib/supabase';
  import { TextInput, ToggleButton } from 'react-native-paper';

  const Today = () => {
    const currentDate = dayjs();
    const [editMode, setEditMode] = useState(false); // State to toggle edit mode
    const [checklistData, setChecklistData] = useState({
      checkboxes: { checkbox1: false, checkbox2: false, checkbox3: false },
      listEntries: { listEntry1: '', listEntry2: '', listEntry3: '' },
      gratitude: { gratitude1: '', gratitude2: '' },
    });
    const [reflection, setReflection] = useState('');
    const [fetchError, setFetchError] = useState(null);
    const [checklist, setChecklist] = useState(null);
    const [session, setSession] = useState<Session | null>(null)



    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
      })
  
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
      })
    }, [])
    useEffect(() => {
      const fetchChecklist = async () => {
        const { data, error } = await supabase.from('masterchecklist').select('*');
        if (error) {
          setFetchError('Could not fetch the checklist');
          setChecklist(null);
        } else {
          setChecklist(data);
          setFetchError(null);
        }
      };

      fetchChecklist();
    }, []);

    useEffect(() => {
      console.log(checklistData);
      console.log(reflection);
    }, [checklistData, reflection]);

    const handleChange = (section, key, value) => {
      if (!editMode) return;
      setChecklistData((prevChecklistData) => ({
        ...prevChecklistData,
        [section]: {
          ...prevChecklistData[section],
          [key]: value,
        },
      }));
    };
    const toggleEdit = () => {setEditMode(!editMode)};

    return (
      <ScrollView>
        <View className="bg-primary w-screen h-screen p-4 ">
          {fetchError && <Text>{fetchError}</Text>}
          {checklist && (
            <View>
              {checklist.map((checkbox) => (
                <Text key={checkbox.id}>{checkbox.info}</Text>
              ))}
            </View>
          )}
          <View className="flex items-center top-5 h-5">
            <Text className="text-secondary font-bold text-base">
              {months[currentDate.month()]} {currentDate.date()}, {currentDate.year()}
            </Text>
          </View>
          <Switch
          aria-label={'Edit'}
          trackColor={'#eaeaea'}
          thumbColor={editMode ? '#0b7a75' : '#7d8491'}
          onValueChange={toggleEdit}
          value={editMode}
        />
          <View className="flex justify-center content-evenly">
            <Header heading="Checklist" />
            <View className="top-10 flex flex-col">
              {[1, 2, 3].map((index) => (
                <View key={index} className="flex flex-row">
                  <CheckBox
                    className='w-10'
                    isChecked={checklistData.checkboxes[`checkbox${index}`]}
                    onPress={() =>
                      handleChange('checkboxes', `checkbox${index}`, !checklistData.checkboxes[`checkbox${index}`])
                    }
                    disabled={!editMode}
                  />
                  <TextInput
                    className="w-1/4"
                    label="Task"
                    mode="outlined"
                    value={checklistData.listEntries[`listEntry${index}`]}
                    placeholder="What to do?"
                    onChangeText={(text) => handleChange('listEntries', `listEntry${index}`, text)}
                    disabled={!editMode}
                  />
                </View>
              ))}

              <Header heading="Gratitude" />
              {[1, 2].map((index) => (
                <TextInput
                  key={index}
                  className="w-1/4 text-primary"
                  value={checklistData.gratitude[`gratitude${index}`]}
                  mode="outlined"
                  placeholder="What are you grateful for today?"
                  onChangeText={(text) => handleChange('gratitude', `gratitude${index}`, text)}
                  disabled={!editMode}
                />
              ))}
              <Header heading="Reflection" />
              <TextInput
                  className="w-1/4 text-primary"
                  value={reflection}
                  mode="outlined"
                  placeholder="Tea ☕"
                  onChangeText={(text) => setReflection(text)}
                  disabled={!editMode}
                />
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  export default Today;
