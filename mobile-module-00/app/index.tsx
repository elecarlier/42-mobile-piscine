import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mobile Module 00</Text>
      <Link href="/ex00" style={styles.link}>Ex00</Link>
      <Link href="/ex01" style={styles.link}>Ex01</Link>
      <Link href="/ex02" style={styles.link}>Ex02</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  link: {
    fontSize: 18,
    color: "#007AFF",
  },
});
