import { Text, View, TextInput, TouchableOpacity, useWindowDimensions } from "react-native";
import { Appbar } from 'react-native-paper';
import { makeStyles } from "../styles/ex02.styles";

export default function Ex02() {
  const { width, height } = useWindowDimensions();
  const styles = makeStyles(width > height);
  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Calculator" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <View style={styles.display}>
        <TextInput value="0" editable={false} style={styles.expressionInput} />
        <TextInput value="0" editable={false} style={styles.resultInput} />
      </View>

      <View style={styles.buttons}>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => console.log("Button pressed: 7")}>
            <Text style={styles.btnText}>7</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => console.log("Button pressed: 8")}>
            <Text style={styles.btnText}>8</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => console.log("Button pressed: 9")}>
            <Text style={styles.btnText}>9</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSpecial]} onPress={() => console.log("Button pressed: C")}>
            <Text style={styles.btnSpecialText}>C</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSpecial]} onPress={() => console.log("Button pressed: AC")}>
            <Text style={styles.btnSpecialText}>AC</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => console.log("Button pressed: 4")}>
            <Text style={styles.btnText}>4</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => console.log("Button pressed: 5")}>
            <Text style={styles.btnText}>5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => console.log("Button pressed: 6")}>
            <Text style={styles.btnText}>6</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnOperator]} onPress={() => console.log("Button pressed: +")}>
            <Text style={styles.btnText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnOperator]} onPress={() => console.log("Button pressed: -")}>
            <Text style={styles.btnText}>-</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => console.log("Button pressed: 1")}>
            <Text style={styles.btnText}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => console.log("Button pressed: 2")}>
            <Text style={styles.btnText}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => console.log("Button pressed: 3")}>
            <Text style={styles.btnText}>3</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnOperator]} onPress={() => console.log("Button pressed: x")}>
            <Text style={styles.btnText}>×</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnOperator]} onPress={() => console.log("Button pressed: /")}>
            <Text style={styles.btnText}>÷</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => console.log("Button pressed: 0")}>
            <Text style={styles.btnText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => console.log("Button pressed: .")}>
            <Text style={styles.btnText}>.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => console.log("Button pressed: 00")}>
            <Text style={styles.btnText}>00</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnOperator]} onPress={() => console.log("Button pressed: =")}>
            <Text style={styles.btnText}>=</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
