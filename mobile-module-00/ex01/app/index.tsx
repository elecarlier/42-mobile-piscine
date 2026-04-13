import {useState} from 'react'
import { Text, View, Button } from "react-native";



export default function App() {
  const [isPressed, setPressed] = useState(false);

  return (
    <View>
      <Text>{isPressed ? "Hello World!" : "I love tractors"}</Text>
      <Button title="Me too" onPress={() => setPressed(!isPressed)} />
    </View>
  );
}
