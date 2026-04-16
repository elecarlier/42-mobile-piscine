import { Stack } from "expo-router";
import { ImageBackground, StyleSheet } from "react-native";

export default function RootLayout() {
  return (
    <ImageBackground
      source={require('../assets/images/clouds_background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});
