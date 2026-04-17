import { Stack } from "expo-router";
import { ThemeProvider, DarkTheme } from '@react-navigation/native';

const TransparentTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: 'transparent' },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={TransparentTheme}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />
    </ThemeProvider>
  );
}
