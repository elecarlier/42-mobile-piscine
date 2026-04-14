import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, useWindowDimensions } from "react-native";
import { Appbar } from 'react-native-paper';
import { makeStyles } from "../styles/ex02.styles";


export default function CalculatorApp() {
	const { width, height } = useWindowDimensions();
	const isLandscape = width > height;
	const styles = makeStyles(isLandscape);
	const [expression, setExpression] = useState("0");
	const [result, setResult] = useState("0");

	const handlePress = (value: string) => {

	console.log(value);
	if (value === "AC") {
		setExpression("0");
		setResult("0");
	} else if (value === "C") {
		setExpression(expression.slice(0, -1) || "0");
	} else if (value === "=") {
		try {
		const res = eval(expression);
		if (!isFinite(res)) {
			setResult("Error");
		} else {
			setResult(String(res));
			setExpression(String(res));
		}
		} catch {
			setResult("Error");
		}
	} else {
		if (expression === "0" && value === "-") {
			setExpression("-");
		} else if (result !== "0" && expression === result) {
			setExpression(result + value);
			setResult("0");
		} else {
			setExpression(expression === "0" ? value : expression + value);
		}
	}
};
  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Calculator" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <View style={styles.display}>
        <TextInput value={expression} editable={false} style={styles.expressionInput} />
        <TextInput value={result} editable={false} style={styles.resultInput} />
      </View>

      <View style={styles.buttons}>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => handlePress("7")}>
            <Text style={styles.btnText}>7</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => handlePress("8")}>
            <Text style={styles.btnText}>8</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => handlePress("9")}>
            <Text style={styles.btnText}>9</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSpecial]} onPress={() => handlePress("C")}>
            <Text style={styles.btnSpecialText}>C</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSpecial]} onPress={() => handlePress("AC")}>
            <Text style={styles.btnSpecialText}>AC</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => handlePress("4")}>
            <Text style={styles.btnText}>4</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => handlePress("5")}>
            <Text style={styles.btnText}>5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => handlePress("6")}>
            <Text style={styles.btnText}>6</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnOperator]} onPress={() => handlePress("+")}>
            <Text style={styles.btnText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnOperator]} onPress={() => handlePress("-")}>
            <Text style={styles.btnText}>-</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => handlePress("1")}>
            <Text style={styles.btnText}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => handlePress("2")}>
            <Text style={styles.btnText}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => handlePress("3")}>
            <Text style={styles.btnText}>3</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnOperator]} onPress={() => handlePress("*")}>
            <Text style={styles.btnText}>×</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnOperator]} onPress={() => handlePress("/")}>
            <Text style={styles.btnText}>÷</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => handlePress("0")}>
            <Text style={styles.btnText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => handlePress(".")}>
            <Text style={styles.btnText}>.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnNumber]} onPress={() => handlePress("00")}>
            <Text style={styles.btnText}>00</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnOperator]} onPress={() => handlePress("=")}>
            <Text style={styles.btnText}>=</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
