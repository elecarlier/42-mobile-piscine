
// =====================
// Layout for the Tab Navigator
// =====================


import { Tabs } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { createContext, useContext, useState, useEffect } from 'react';
import { z } from 'zod';





// =====================
// WEATHER API
// =====================
const WEATHER_URL = (lat: number, lon: number) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
  `&current=temperature_2m,wind_speed_10m,weathercode` +
  `&hourly=temperature_2m,wind_speed_10m,weathercode` +
  `&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,weathercode` +
  `&timezone=auto&forecast_days=7`;


// =====================
// WEATHER DESCRIPTION
// =====================
const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  61: 'Rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Snow',
  73: 'Snow',
  75: 'Heavy snow',
  80: 'Showers',
  81: 'Showers',
  82: 'Heavy showers',
  95: 'Thunderstorm',
};

export function weatherDesc(code: number) {
  return WEATHER_DESCRIPTIONS[code] ?? `Code ${code}`;
}


// =====================
// ZOD
// =====================
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

export type WeatherData = z.infer<typeof WeatherSchema>;

export type CityInfo = {
  name: string;
  region: string;
  country: string;
};

type CitySuggestion = {
  id: number;
  name: string;
  admin1: string;
  country: string;
  latitude: number;
  longitude: number;
};


// =====================
// CONTEXT
// =====================
const WeatherContext = createContext<{
  weather: WeatherData | null;
  city: CityInfo | null;
}>({
  weather: null,
  city: null,
});

export const useWeather = () => useContext(WeatherContext);


// =====================
// COMPONENT
// =====================
export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [city, setCity] = useState<CityInfo | null>(null);
  const [overlayHeight, setOverlayHeight] = useState(0);

  useEffect(() => {
    handleGeolocation();
  }, []);

  // =====================
  // SELECT CITY
  // =====================
  async function handleSelectCity(s: CitySuggestion) {
    setSearch(s.name);
    setShowSuggestions(false);

    const res = await fetch(WEATHER_URL(s.latitude, s.longitude));
    const json = await res.json();

    setWeather(WeatherSchema.parse(json));
    setCity({ name: s.name, region: s.admin1, country: s.country });
  }

  // =====================
  // SEARCH CITY
  // =====================
  async function handleSearchChange(text: string) {
    setSearch(text);

    if (text.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(text)}&count=5`
    );

    const data = await res.json();
    const results: CitySuggestion[] = data.results ?? [];

    setSuggestions(results);
    setShowSuggestions(results.length > 0);
  }

  // =====================
  // GEOLOCATION
  // =====================
async function handleGeolocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = loc.coords;

    // 🌤️ WEATHER
    const weatherRes = await fetch(WEATHER_URL(latitude, longitude));
    const weatherJson = await weatherRes.json();
    setWeather(WeatherSchema.parse(weatherJson));

    // 📍 REVERSE GEOCODING (IMPORTANT)
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      {
        headers: {
          'User-Agent': 'weather_app/1.0',
        },
      }
    );

    const geoJson = await geoRes.json();

    setCity({
      name:
        geoJson.address?.city ||
        geoJson.address?.town ||
        geoJson.address?.village ||
        'Unknown',
      region: geoJson.address?.state || '',
      country: geoJson.address?.country || '',
    });

  } catch (e) {
    console.log('Geolocation error:', e);
  }
}


  // =====================
  // UI
  // =====================
  return (
    <WeatherContext.Provider value={{ weather, city }}>
      <ImageBackground
        source={require('../../assets/images/clouds_background.jpg')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >

        <Tabs
          screenOptions={{
            headerShown: false,

            tabBarStyle: {
              backgroundColor: 'rgba(0,0,0,0.4)',
              borderTopWidth: 0,
            },

            tabBarBackground: () => (
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} />
            ),

            sceneContainerStyle: {
              backgroundColor: 'transparent',
            },

            sceneStyle: {
              backgroundColor: 'transparent',
              paddingTop: overlayHeight,
            },
          }}
        >
          <Tabs.Screen
            name="currently"
            options={{
              title: 'Currently',
              tabBarIcon: ({ color }) => (
                <Ionicons name="time-outline" size={24} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="today"
            options={{
              title: 'Today',
              tabBarIcon: ({ color }) => (
                <Ionicons name="today-outline" size={24} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="weekly"
            options={{
              title: 'Weekly',
              tabBarIcon: ({ color }) => (
                <Ionicons name="calendar-outline" size={24} color={color} />
              ),
            }}
          />
        </Tabs>


        {/* ===================== */}
        {/* SEARCH OVERLAY */}
        {/* ===================== */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}
          onLayout={(e) => setOverlayHeight(e.nativeEvent.layout.height)}
        >

          <View
            style={{
              paddingTop: insets.top + 8,
              paddingHorizontal: 10,
              paddingBottom: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(0,0,0,0.2)',
            }}
          >
            <TextInput
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.15)',
                padding: 10,
                borderRadius: 10,
                color: 'white',
              }}
              placeholder="Search city..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={search}
              onChangeText={handleSearchChange}
            />

            <TouchableOpacity onPress={handleGeolocation}>
              <Ionicons name="location-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {showSuggestions &&
            suggestions.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => handleSelectCity(c)}
                style={{
                  padding: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(255,255,255,0.2)',
                  backgroundColor: 'rgba(0,0,0,0.25)',
                }}
              >
                <Text style={{ color: 'white' }}>
                  {c.name}, {c.admin1}, {c.country}
                </Text>
              </TouchableOpacity>
            ))}
        </View>

      </ImageBackground>
    </WeatherContext.Provider>
  );
}
