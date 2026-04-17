import { Stack } from "expo-router";
import { ImageBackground } from "react-native";
import { ThemeProvider, DarkTheme } from '@react-navigation/native';

const TransparentTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: 'transparent' },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={TransparentTheme}>
      <ImageBackground
        source={require('../assets/images/clouds_background.jpg')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />
      </ImageBackground>
    </ThemeProvider>
  );
}
