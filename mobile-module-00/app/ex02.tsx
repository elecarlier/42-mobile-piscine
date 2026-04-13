import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity } from "react-native";
import { Appbar } from 'react-native-paper';

export default function Ex02() {
  return (
    <View style={{ flex: 1 }}>        {/* ← le "un seul truc" */}
      <Appbar.Header>
        <Appbar.Content title="Calculator" />
      </Appbar.Header>
      <TextInput value="0" />
      <TextInput value="0" />
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity style={{ flex: 1 }}>
          <Text>7</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }}>
          <Text>8</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }}>
          <Text>9</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }}>
          <Text>9</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
