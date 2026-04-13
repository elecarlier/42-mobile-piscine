import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  appbar: {
    backgroundColor: "#1C1C1E",
  },
  appbarTitle: {
    color: "white",
  },
  display: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  expressionInput: {
    color: "#888",
    fontSize: 28,
    textAlign: "right",
  },
  resultInput: {
    color: "white",
    fontSize: 56,
    textAlign: "right",
  },
  buttons: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  btn: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  btnNumber: {
    backgroundColor: "#333",
  },
  btnOperator: {
    backgroundColor: "#FF9500",
  },
  btnSpecial: {
    backgroundColor: "#A5A5A5",
  },
  btnText: {
    color: "white",
    fontSize: 22,
    fontWeight: "500",
  },
  btnSpecialText: {
    color: "black",
    fontSize: 22,
    fontWeight: "500",
  },
});
