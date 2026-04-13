import { useState } from "react";
import { Text, View, Button } from "react-native";

export default function Ex01() {
  const [isPressed, setPressed] = useState(false);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{isPressed ? "Hello World!" : "I love tractors"}</Text>
      <Button title="Me too" onPress={() => setPressed(!isPressed)} />
    </View>
  );
}
