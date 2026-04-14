import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationIndependentTree } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useState, useEffect } from "react";
import { z } from 'zod';

// Zod schema to validate and type the open-meteo API response
const WeatherSchema = z.object({
  current: z.object({
    temperature_2m: z.number(),
    wind_speed_10m: z.number(),
    weathercode: z.number(),
  }),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number()),
    wind_speed_10m: z.array(z.number()),
    weathercode: z.array(z.number()),
  }),
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    wind_speed_10m_max: z.array(z.number()),
    weathercode: z.array(z.number()),
  }),
});

// WMO weather interpretation codes (standard used by open-meteo)
const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Depositing rime fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
  56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  66: 'Light freezing rain', 67: 'Heavy freezing rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
  85: 'Slight snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
};

function weatherDesc(code: number): string {
  return WEATHER_DESCRIPTIONS[code] ?? `Code ${code}`;
}

// Builds the open-meteo forecast URL requesting current, hourly and daily data
const WEATHER_URL = (lat: number, lon: number) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
  `&current=temperature_2m,wind_speed_10m,weathercode` +
  `&hourly=temperature_2m,wind_speed_10m,weathercode` +
  `&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,weathercode` +
  `&timezone=auto&forecast_days=7`;

type WeatherData = z.infer<typeof WeatherSchema>;

// Stores the selected city's display info (name, region, country)
type CityInfo = { name: string; region: string; country: string };

const TopTab = createMaterialTopTabNavigator();

// Shared header displayed at the top of each tab
function LocationHeader({ city }: { city: CityInfo | null }) {
  if (!city) return null;
  return <Text style={{ padding: 12, fontSize: 16, fontWeight: 'bold' }}>{city.name}, {city.region}, {city.country}</Text>;
}

function Currently({ weather, city }: { weather: WeatherData | null; city: CityInfo | null }) {
  if (!weather) return <Text style={{ padding: 16 }}>Search a city</Text>;
  return (
    <View style={{ padding: 16, gap: 8 }}>
      <LocationHeader city={city} />
      <Text style={{ fontSize: 18 }}>Temperature: {weather.current.temperature_2m}°C</Text>
      <Text style={{ fontSize: 18 }}>Weather: {weatherDesc(weather.current.weathercode)}</Text>
      <Text style={{ fontSize: 18 }}>Wind: {weather.current.wind_speed_10m} km/h</Text>
    </View>
  );
}

function Today({ weather, city }: { weather: WeatherData | null; city: CityInfo | null }) {
  if (!weather) return <Text style={{ padding: 16 }}>Search a city</Text>;

  // daily.time[0] is today's date (YYYY-MM-DD); filter hourly entries that start with it
  const today = weather.daily.time[0];
  const entries = weather.hourly.time
    .map((t, i) => ({ time: t, temp: weather.hourly.temperature_2m[i], wind: weather.hourly.wind_speed_10m[i], code: weather.hourly.weathercode[i] }))
    .filter(e => e.time.startsWith(today));

  return (
    <ScrollView>
      <LocationHeader city={city} />
      {entries.map(e => (
        <View key={e.time} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
          {/* e.time format is "YYYY-MM-DDTHH:MM", slice to get "HH:MM" */}
          <Text style={{ width: 50 }}>{e.time.slice(11, 16)}</Text>
          <Text style={{ width: 60 }}>{e.temp}°C</Text>
          <Text style={{ width: 90 }}>{e.wind} km/h</Text>
          <Text style={{ flex: 1 }}>{weatherDesc(e.code)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function Weekly({ weather, city }: { weather: WeatherData | null; city: CityInfo | null }) {
  if (!weather) return <Text style={{ padding: 16 }}>Search a city</Text>;

  return (
    <ScrollView>
      <LocationHeader city={city} />
      {weather.daily.time.map((date, i) => (
        <View key={date} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
          <Text style={{ width: 90 }}>{date}</Text>
          <Text style={{ width: 90 }}>{weather.daily.temperature_2m_min[i]}° / {weather.daily.temperature_2m_max[i]}°C</Text>
          <Text style={{ width: 80 }}>{weather.daily.wind_speed_10m_max[i]} km/h</Text>
          <Text style={{ flex: 1 }}>{weatherDesc(weather.daily.weathercode[i])}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// Shape of a city result from the open-meteo geocoding API
type CitySuggestion = {
  id: number;
  name: string;
  admin1: string; // region/state
  country: string;
  latitude: number;
  longitude: number;
};

export default function WeatherApp() {
  const [search, setSearch] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [city, setCity] = useState<CityInfo | null>(null);

  // Request geolocation on first render
  useEffect(() => {
    handleGeolocation();
  }, []);

  // Called when the user taps a city from the suggestion list
  async function handleSelectCity(suggestion: CitySuggestion) {
    setSearch(suggestion.name);
    setShowSuggestions(false);
    setCity({ name: suggestion.name, region: suggestion.admin1, country: suggestion.country });

    const weatherRes = await fetch(WEATHER_URL(suggestion.latitude, suggestion.longitude));
    const weatherJson = await weatherRes.json();
    setWeather(WeatherSchema.parse(weatherJson));
  }

  // Fetches city suggestions from open-meteo geocoding as the user types
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

  // Requests GPS permission, then uses Nominatim for reverse geocoding (coords → city name)
  async function handleGeolocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setPermissionDenied(true);
      return;
    }
    setPermissionDenied(false);
    try {
      const { coords } = await Location.getCurrentPositionAsync({});

      // Nominatim (OpenStreetMap) reverse geocoding: lat/lon → address
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
      );
      const geoJson = await geoRes.json();
      // city/town/village depending on the size of the locality
      setCity({
        name: geoJson.address?.city ?? geoJson.address?.town ?? geoJson.address?.village ?? 'Unknown',
        region: geoJson.address?.state ?? '',
        country: geoJson.address?.country ?? '',
      });

      const weatherRes = await fetch(WEATHER_URL(coords.latitude, coords.longitude));
      const weatherJson = await weatherRes.json();
      setWeather(WeatherSchema.parse(weatherJson));
    } catch {
      setPermissionDenied(true);
    }
  }

  return (
    <NavigationIndependentTree>
      <View style={{ flex: 1 }}>
        {/* Search bar + geolocation button */}
        <View style={{ flexDirection: 'row', padding: 10, backgroundColor: '#333' }}>
          <TextInput
            style={{ flex: 1, backgroundColor: 'white', padding: 8, borderRadius: 5 }}
            placeholder="Search city..."
            value={search}
            onChangeText={handleSearchChange}
            onSubmitEditing={() => {}}
          />
          <TouchableOpacity onPress={handleGeolocation} style={{ padding: 8 }}>
            <Ionicons name="location-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Autocomplete suggestions dropdown */}
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

        {/* Three tabs: Currently / Today / Weekly — weather and city state are shared */}
        <TopTab.Navigator
          tabBarPosition="bottom"
          screenOptions={{ swipeEnabled: true }}
        >
          <TopTab.Screen name="Currently" options={{ tabBarIcon: ({ color }) => <Ionicons name="time-outline" size={24} color={color} /> }}>
            {() => <Currently weather={weather} city={city} />}
          </TopTab.Screen>
          <TopTab.Screen name="Today" options={{ tabBarIcon: ({ color }) => <Ionicons name="today-outline" size={24} color={color} /> }}>
            {() => <Today weather={weather} city={city} />}
          </TopTab.Screen>
          <TopTab.Screen name="Weekly" options={{ tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={24} color={color} /> }}>
            {() => <Weekly weather={weather} city={city} />}
          </TopTab.Screen>
        </TopTab.Navigator>
      </View>
    </NavigationIndependentTree>
  );
}
