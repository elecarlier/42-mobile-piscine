import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationIndependentTree } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useState, useEffect } from "react";
import { z } from 'zod';


const WeatherSchema = z.object({
  current: z.object({
    temperature_2m: z.number(),
    wind_speed_10m: z.number(),
  }),
});



async function fetchWeather(city: string): Promise<WeatherData> {

  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
  );
  const geoData = await geoRes.json();

  if (!geoData.results?.length) {
    throw new Error(`No city with the name : ${city}`);
  }

  const { latitude, longitude } = geoData.results[0];

  // Étape 2 : latitude/longitude → météo
  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m`
  );
  const weatherJson = await weatherRes.json();

  // Zod vérifie que le JSON a bien la forme attendue
  return WeatherSchema.parse(weatherJson);
}

type WeatherData = z.infer<typeof WeatherSchema>;

const TopTab = createMaterialTopTabNavigator();

function Currently({ weather }: { weather: WeatherData | null }) {
  if (!weather) return <Text>Recherche une ville</Text>;
  return (
    <View>
      <Text>Temperature : {weather.current.temperature_2m}°C</Text>
      <Text> Wind : {weather.current.wind_speed_10m} km/h</Text>
    </View>
  );
}
function Today({ location }: { location: string }) {
  return <View><Text>Today {location}</Text></View>
}
function Weekly({ location }: { location: string }) {
  return <View><Text>Weekly {location}</Text></View>
}

type CitySuggestion = {
  id: number;
  name: string;
  admin1: string;
  country: string;
  latitude: number;
  longitude: number;
};

export default function WeatherApp() {
  const [locationText, setLocationText] = useState('');
  const [search, setSearch] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
  handleGeolocation();
  }, []);

	async function handleSelectCity(city: CitySuggestion) {
	setSearch(city.name);
	setShowSuggestions(false);

	const weatherRes = await fetch(
		`https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,wind_speed_10m`
	);
	const weatherJson = await weatherRes.json();
	setWeather(WeatherSchema.parse(weatherJson));
	}

  async function handleSearchChange(text: string) {
  setSearch(text);

  if (text.length < 2) {
    setSuggestions([]);
    return;
  }

  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(text)}&count=5`
  );
  const data = await res.json();
  setSuggestions(data.results ?? []);
  setShowSuggestions(true);
}

  async function handleGeolocation() {
    console.log('handleGeolocation appelée')
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setPermissionDenied(true);
      return;
    }
    setPermissionDenied(false);
    const { coords } = await Location.getCurrentPositionAsync({});
    setLocationText(`lat: ${coords.latitude}, lon: ${coords.longitude}`);
  }

  return (
    <NavigationIndependentTree>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', padding: 10, backgroundColor: '#333' }}>
          <TextInput
            style={{ flex: 1, backgroundColor: 'white', padding: 8, borderRadius: 5 }}
            placeholder="Search city..."
            value={search}
            // onChangeText={setSearch}
			onChangeText={handleSearchChange}
            onSubmitEditing={() => setLocationText(search)}
          />
          <TouchableOpacity onPress={handleGeolocation} style={{ padding: 8 }}>
            <Ionicons name="location-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
		{showSuggestions && suggestions.map((city) => (
		<TouchableOpacity
			key={city.id}
			onPress={() => handleSelectCity(city)}
			style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: 'white' }}
		>
			<Text>{city.name}, {city.admin1}, {city.country}</Text>
		</TouchableOpacity>
		))}
        {permissionDenied && (
          <Text style={{ color: 'orange', padding: 8 }}>
             Geolocation is not available, please enable it in your App settings
          </Text>
        )}
        <TopTab.Navigator
          tabBarPosition="bottom"
          screenOptions={{ swipeEnabled: true }}
        >
		<TopTab.Screen name="Currently" options={{ tabBarIcon: ({ color }) => <Ionicons name="time-outline" size={24} color={color} /> }}>
		{() => <Currently weather={weather} />}
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
