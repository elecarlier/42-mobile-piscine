import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline, Line, Text as SvgText } from 'react-native-svg';
import { useWeather } from './_layout';

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

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 56;
const CHART_HEIGHT = 120;
const PAD_LEFT = 30;
const PAD_RIGHT = 10;
const PAD_TOP = 16;
const PAD_BOTTOM = 24;

function TempChart({ entries }: { entries: { hour: string; temp: number }[] }) {
  const points = entries.filter((_, i) => i % 3 === 0);
  if (points.length < 2) return null;

  const temps = points.map(p => p.temp);
  const minT = Math.min(...temps) - 1;
  const maxT = Math.max(...temps) + 1;

  const innerW = CHART_WIDTH - PAD_LEFT - PAD_RIGHT;
  const innerH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;

  const x = (i: number) => PAD_LEFT + (i / (points.length - 1)) * innerW;
  const y = (t: number) => PAD_TOP + ((maxT - t) / (maxT - minT)) * innerH;

  const polyPoints = points.map((p, i) => `${x(i)},${y(p.temp)}`).join(' ');
  const ticks = [minT + 1, (minT + maxT) / 2, maxT - 1].map(t => Math.round(t));

  return (
    <View pointerEvents="none">
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
      {ticks.map(t => (
        <Line
          key={t}
          x1={PAD_LEFT} y1={y(t)}
          x2={CHART_WIDTH - PAD_RIGHT} y2={y(t)}
          stroke="rgba(0,0,0,0.08)" strokeWidth={1}
        />
      ))}
      {ticks.map(t => (
        <SvgText key={`label-${t}`} x={PAD_LEFT - 4} y={y(t) + 4} fontSize={9} fill="#888" textAnchor="end">
          {t}°
        </SvgText>
      ))}
      <Polyline
        points={polyPoints}
        fill="none"
        stroke="#4a90e2"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <SvgText key={`x-${p.hour}`} x={x(i)} y={CHART_HEIGHT - 4} fontSize={9} fill="#888" textAnchor="middle">
          {p.hour}
        </SvgText>
      ))}
    </Svg>
    </View>
  );
}

export default function TodayScreen() {
  const { weather, city } = useWeather();

  if (!weather) return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Search for a city or enable location</Text>
    </View>
  );

  const today = weather.daily.time[0];
  const entries = weather.hourly.time
    .map((t, i) => ({
      time: t,
      hour: t.slice(11, 16),
      temp: weather.hourly.temperature_2m[i],
      wind: weather.hourly.wind_speed_10m[i],
      code: weather.hourly.weathercode[i],
    }))
    .filter(e => e.time.startsWith(today));

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} bounces={false} overScrollMode="never">
        {city && (
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={16} color="#1a1a2e" />
            <Text style={styles.locationText}>{city.name}, {city.region}, {city.country}</Text>
          </View>
        )}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Temperature today</Text>
          <TempChart entries={entries} />
        </View>
        <View style={styles.listCard}>
          {entries.map((e, i) => (
            <View key={e.time} style={[styles.row, i < entries.length - 1 && styles.rowBorder]}>
              <Text style={styles.timeText}>{e.hour}</Text>
              <Ionicons name={weatherIcon(e.code)} size={20} color="#4a90e2" style={styles.rowIcon} />
              <Text style={styles.tempText}>{Math.round(e.temp)}°C</Text>
              <View style={styles.windCell}>
                <Ionicons name="speedometer-outline" size={14} color="#888" />
                <Text style={styles.windText}>{e.wind} km/h</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 80 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholder: { color: 'rgba(0,0,0,0.5)', fontSize: 16 },
  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.15)', paddingHorizontal: 14,
    paddingVertical: 6, borderRadius: 20, alignSelf: 'center',
  },
  locationText: { color: '#1a1a2e', fontSize: 16, fontWeight: '600' },
  chartCard: { backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 16, padding: 12 },
  chartTitle: { fontSize: 14, fontWeight: '600', color: '#1a1a2e', marginBottom: 8 },
  listCard: { backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.07)' },
  timeText: { width: 44, fontSize: 13, fontWeight: '600', color: '#1a1a2e' },
  rowIcon: { width: 24 },
  tempText: { width: 48, fontSize: 14, fontWeight: '700', color: '#1a1a2e' },
  windCell: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  windText: { fontSize: 12, color: '#555' },
});
