import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationIndependentTree } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";

const TopTab = createMaterialTopTabNavigator();

function Currently({ location }: { location: string }) {
  return <View><Text>Currently {location}</Text></View>
}
function Today({ location }: { location: string }) {
  return <View><Text>Today {location}</Text></View>
}
function Weekly({ location }: { location: string }) {
  return <View><Text>Weekly {location}</Text></View>
}

export default function WeatherApp() {
  const [locationText, setLocationText] = useState('');
  const [search, setSearch] = useState('');

  return (
    <NavigationIndependentTree>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', padding: 10, backgroundColor: '#333' }}>
          <TextInput
            style={{ flex: 1, backgroundColor: 'white', padding: 8, borderRadius: 5 }}
            placeholder="Search city..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => setLocationText(search)}
          />
          <TouchableOpacity onPress={() => setLocationText('Geolocation')} style={{ padding: 8 }}>
            <Ionicons name="location-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <TopTab.Navigator
          tabBarPosition="bottom"
          screenOptions={{ swipeEnabled: true }}
        >
          <TopTab.Screen name="Currently" options={{ tabBarIcon: ({ color }) => <Ionicons name="time-outline" size={24} color={color} /> }}>
            {() => <Currently location={locationText} />}
          </TopTab.Screen>
          <TopTab.Screen name="Today" options={{ tabBarIcon: ({ color }) => <Ionicons name="today-outline" size={24} color={color} /> }}>
            {() => <Today location={locationText} />}
          </TopTab.Screen>
          <TopTab.Screen name="Weekly" options={{ tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={24} color={color} /> }}>
            {() => <Weekly location={locationText} />}
          </TopTab.Screen>
        </TopTab.Navigator>
      </View>
    </NavigationIndependentTree>
  );
}
