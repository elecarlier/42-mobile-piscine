import { Tabs } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { createContext, useContext, useState, useEffect } from 'react';
import { z } from 'zod';

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

export function weatherDesc(code: number): string {
  return WEATHER_DESCRIPTIONS[code] ?? `Code ${code}`;
}

const WEATHER_URL = (lat: number, lon: number) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
  `&current=temperature_2m,wind_speed_10m,weathercode` +
  `&hourly=temperature_2m,wind_speed_10m,weathercode` +
  `&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,weathercode` +
  `&timezone=auto&forecast_days=7`;

export type WeatherData = z.infer<typeof WeatherSchema>;
export type CityInfo = { name: string; region: string; country: string };

type CitySuggestion = {
  id: number;
  name: string;
  admin1: string;
  country: string;
  latitude: number;
  longitude: number;
};

type WeatherContextValue = {
  weather: WeatherData | null;
  city: CityInfo | null;
};

export const WeatherContext = createContext<WeatherContextValue>({ weather: null, city: null });
export function useWeather() { return useContext(WeatherContext); }

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [city, setCity] = useState<CityInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { handleGeolocation(); }, []);

  async function handleSelectCity(suggestion: CitySuggestion) {
    setSearch(suggestion.name);
    setShowSuggestions(false);
    setError(null);
    try {
      const weatherRes = await fetch(WEATHER_URL(suggestion.latitude, suggestion.longitude));
      if (!weatherRes.ok) throw new Error('connection');
      const weatherJson = await weatherRes.json();
      setWeather(WeatherSchema.parse(weatherJson));
      setCity({ name: suggestion.name, region: suggestion.admin1, country: suggestion.country });
    } catch {
      setError('Connection to the API failed. Please try again.');
    }
  }

  async function handleSearchChange(text: string) {
    setSearch(text);
    setError(null);
    setPermissionDenied(false);
    if (text.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(text)}&count=5`
      );
      if (!res.ok) throw new Error('connection');
      const data = await res.json();
      const results: CitySuggestion[] = data.results ?? [];
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      if (results.length === 0) setError('No city found with that name.');
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
      setError('Connection to the API failed. Please try again.');
    }
  }

  async function handleGeolocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setPermissionDenied(true);
      return;
    }
    setPermissionDenied(false);
    try {
      const coords = await new Promise<Location.LocationObjectCoords>((resolve, reject) => {
        let sub: Location.LocationSubscription | null = null;
        const timer = setTimeout(() => { sub?.remove(); reject(new Error('Location timeout')); }, 10000);
        Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High },
          (loc) => { clearTimeout(timer); sub?.remove(); resolve(loc.coords); }
        ).then(s => { sub = s; }).catch(reject);
      });

      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
        { headers: { 'User-Agent': 'weather_app/1.0' } }
      );
      if (!geoRes.ok) throw new Error(`Nominatim error: ${geoRes.status}`);
      const geoJson = await geoRes.json();
      setCity({
        name: geoJson.address?.city ?? geoJson.address?.town ?? geoJson.address?.village ?? 'Unknown',
        region: geoJson.address?.state ?? '',
        country: geoJson.address?.country ?? '',
      });

      const weatherRes = await fetch(WEATHER_URL(coords.latitude, coords.longitude));
      if (!weatherRes.ok) throw new Error(`Weather API error: ${weatherRes.status}`);
      const weatherJson = await weatherRes.json();
      setWeather(WeatherSchema.parse(weatherJson));
    } catch (e) {
      console.log('error:', e);
      setPermissionDenied(true);
    }
  }

  return (
    <WeatherContext.Provider value={{ weather, city }}>
      <View style={{ flex: 1 }}>
        <Image
          source={require('../../assets/images/clouds_background.jpg')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      <View style={{ flex: 1, paddingTop: insets.top }}>
          <View style={{ flexDirection: 'row', padding: 10, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <TextInput
              style={{ flex: 1, backgroundColor: 'white', padding: 8, borderRadius: 5 }}
              placeholder="Search city..."
              value={search}
              onChangeText={handleSearchChange}
              onSubmitEditing={() => { if (suggestions.length > 0) handleSelectCity(suggestions[0]); }}
            />
            <TouchableOpacity onPress={handleGeolocation} style={{ padding: 8 }}>
              <Ionicons name="location-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {showSuggestions && suggestions.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => handleSelectCity(c)}
              style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: 'white' }}
            >
              <Text>{c.name}, {c.admin1}, {c.country}</Text>
            </TouchableOpacity>
          ))}

          {permissionDenied && (
            <Text style={{ color: 'orange', padding: 8 }}>
              Geolocation is not available, please enable it in your App settings
            </Text>
          )}
          {error && (
            <Text style={{ color: 'red', padding: 8 }}>{error}</Text>
          )}

          <Tabs
              screenOptions={{
                headerShown: false,
                tabBarStyle: { backgroundColor: 'rgba(0,0,0,0.4)', borderTopWidth: 0, elevation: 0 },
                tabBarBackground: () => <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} />,
                sceneStyle: { backgroundColor: 'transparent' },
              }}
            >
              <Tabs.Screen
                name="currently"
                options={{ title: 'Currently', tabBarIcon: ({ color }) => <Ionicons name="time-outline" size={24} color={color} /> }}
              />
              <Tabs.Screen
                name="today"
                options={{ title: 'Today', tabBarIcon: ({ color }) => <Ionicons name="today-outline" size={24} color={color} /> }}
              />
              <Tabs.Screen
                name="weekly"
                options={{ title: 'Weekly', tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={24} color={color} /> }}
              />
            </Tabs>
        </View>
      </View>
    </WeatherContext.Provider>
  );
}
