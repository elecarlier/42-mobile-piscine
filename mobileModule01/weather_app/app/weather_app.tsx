import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationIndependentTree } from '@react-navigation/native';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TopTab = createMaterialTopTabNavigator();
const BottomTab = createBottomTabNavigator();

function Currently() { return <View><Text>Currently</Text></View> }
function Today() { return <View><Text>Today</Text></View> }
function Weekly() { return <View><Text>Weekly</Text></View> }

function TabsWithSwipe() {
  return (
    <TopTab.Navigator
      tabBarPosition="bottom"
      screenOptions={{ swipeEnabled: true }}
    >
      <TopTab.Screen
        name="Currently"
        component={Currently}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="time-outline" size={24} color={color} />
        }}
      />
      <TopTab.Screen
        name="Today"
        component={Today}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="today-outline" size={24} color={color} />
        }}
      />
      <TopTab.Screen
        name="Weekly"
        component={Weekly}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={24} color={color} />
        }}
      />
    </TopTab.Navigator>
  );
}

export default function WeatherApp() {
  return (
    <NavigationIndependentTree>
      <TabsWithSwipe />
    </NavigationIndependentTree>
  );
}
