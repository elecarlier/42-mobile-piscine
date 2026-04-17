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

// "2024-04-17" → "Thu"
function dayLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 56;
const CHART_HEIGHT = 140;
const PAD_LEFT = 30;
const PAD_RIGHT = 10;
const PAD_TOP = 16;
const PAD_BOTTOM = 24;

function WeekChart({ days }: { days: { label: string; min: number; max: number }[] }) {
  if (days.length < 2) return null;

  const allTemps = [...days.map(d => d.min), ...days.map(d => d.max)];
  const minT = Math.min(...allTemps) - 1;
  const maxT = Math.max(...allTemps) + 1;

  const innerW = CHART_WIDTH - PAD_LEFT - PAD_RIGHT;
  const innerH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;

  const x = (i: number) => PAD_LEFT + (i / (days.length - 1)) * innerW;
  const y = (t: number) => PAD_TOP + ((maxT - t) / (maxT - minT)) * innerH;

  const maxPoints = days.map((d, i) => `${x(i)},${y(d.max)}`).join(' ');
  const minPoints = days.map((d, i) => `${x(i)},${y(d.min)}`).join(' ');

  const ticks = [minT + 1, (minT + maxT) / 2, maxT - 1].map(t => Math.round(t));

  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT} pointerEvents="none">
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

      {/* Max curve — red/warm */}
      <Polyline
        points={maxPoints}
        fill="none"
        stroke="#e25c4a"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* Min curve — blue/cool */}
      <Polyline
        points={minPoints}
        fill="none"
        stroke="#4a90e2"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* X axis labels */}
      {days.map((d, i) => (
        <SvgText key={`x-${d.label}-${i}`} x={x(i)} y={CHART_HEIGHT - 4} fontSize={9} fill="#888" textAnchor="middle">
          {d.label}
        </SvgText>
      ))}
    </Svg>
  );
}

export default function WeeklyScreen() {
  const { weather, city } = useWeather();

  if (!weather) return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Search for a city or enable location</Text>
    </View>
  );

  const days = weather.daily.time.map((date, i) => ({
    date,
    label: dayLabel(date),
    min: weather.daily.temperature_2m_min[i],
    max: weather.daily.temperature_2m_max[i],
    code: weather.daily.weathercode[i],
  }));

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} nestedScrollEnabled overScrollMode="never">
        {city && (
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={16} color="#1a1a2e" />
            <Text style={styles.locationText}>{city.name}, {city.region}, {city.country}</Text>
          </View>
        )}

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>7-day temperature</Text>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#e25c4a' }]} />
              <Text style={styles.legendText}>Max</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4a90e2' }]} />
              <Text style={styles.legendText}>Min</Text>
            </View>
          </View>
          <WeekChart days={days} />
        </View>

        <View style={styles.listCard}>
          {days.map((d, i) => (
            <View key={d.date} style={[styles.row, i < days.length - 1 && styles.rowBorder]}>
              <Text style={styles.dayText}>{d.label}</Text>
              <Ionicons name={weatherIcon(d.code)} size={20} color="#4a90e2" style={styles.rowIcon} />
              <Text style={styles.minTemp}>{Math.round(d.min)}°</Text>
              <Text style={styles.separator}>/</Text>
              <Text style={styles.maxTemp}>{Math.round(d.max)}°C</Text>
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
  chartTitle: { fontSize: 14, fontWeight: '600', color: '#1a1a2e', marginBottom: 4 },
  legend: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: '#555' },
  listCard: { backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.07)' },
  dayText: { width: 36, fontSize: 13, fontWeight: '600', color: '#1a1a2e' },
  rowIcon: { width: 24 },
  minTemp: { fontSize: 14, color: '#4a90e2', fontWeight: '600' },
  separator: { fontSize: 14, color: '#aaa' },
  maxTemp: { fontSize: 14, color: '#e25c4a', fontWeight: '600' },
});
