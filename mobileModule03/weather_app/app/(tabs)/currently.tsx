import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWeather, weatherDesc } from './_layout';

function weatherIcon(code: number): keyof typeof Ionicons.glyphMap {
  if (code === 0 || code === 1) return 'sunny';
  if (code === 2) return 'partly-sunny';
  if (code === 3) return 'cloud';
  if (code === 45 || code === 48) return 'cloudy';
  if (code >= 51 && code <= 67) return 'rainy';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'rainy';
  if (code >= 85 && code <= 86) return 'snow';
  if (code >= 95) return 'thunderstorm';
  return 'cloud';
}

export default function CurrentlyScreen() {
  const { weather, city } = useWeather();

  if (!weather) return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Search for a city or enable location</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {city && (
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={16} color="#1a1a2e" />
          <Text style={styles.locationText}>{city.name}, {city.region}, {city.country}</Text>
        </View>
      )}

      <Ionicons
        name={weatherIcon(weather.current.weathercode)}
        size={100}
        color="#1a1a2e"
        style={styles.icon}
      />

      <Text style={styles.temperature}>{Math.round(weather.current.temperature_2m)}°C</Text>

      <Text style={styles.description}>{weatherDesc(weather.current.weathercode)}</Text>

      <View style={styles.windRow}>
        <Ionicons name="arrow-forward-outline" size={20} color="#2d2d2d" />
        <Text style={styles.windText}>{weather.current.wind_speed_10m} km/h</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholder: {
    color: 'rgba(0,0,0,0.5)',
    fontSize: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  locationText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    marginBottom: 8,
  },
  temperature: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#1a1a2e',
    letterSpacing: -2,
  },
  description: {
    fontSize: 22,
    color: '#2d2d2d',
    fontWeight: '400',
  },
  windRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  windText: {
    color: '#1a1a2e',
    fontSize: 16,
  },
});
