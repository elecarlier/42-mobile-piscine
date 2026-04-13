import { Text, View, Button } from "react-native";

export default function Ex00() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>I love tractors</Text>
      <Button
        title="Me too"
        onPress={() => console.log("Button pressed")}
      />
    </View>
  );
}
