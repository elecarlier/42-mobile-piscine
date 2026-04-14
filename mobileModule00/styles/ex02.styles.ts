import { StyleSheet } from "react-native";

export const makeStyles = (isLandscape: boolean) => StyleSheet.create({
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
    flex: isLandscape ? 1 : 2,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: isLandscape ? 4 : 12,
  },
  expressionInput: {
    color: "#888",
    fontSize: isLandscape ? 18 : 28,
    textAlign: "right",
  },
  resultInput: {
    color: "white",
    fontSize: isLandscape ? 32 : 56,
    textAlign: "right",
  },
  buttons: {
    flex: isLandscape ? 3 : 4,
    paddingHorizontal: 8,
    paddingBottom: isLandscape ? 4 : 16,
  },
  row: {
    flexDirection: "row",
    flex: 1,
    marginBottom: 4,
  },
  btn: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
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
    fontSize: isLandscape ? 16 : 22,
    fontWeight: "500",
  },
  btnSpecialText: {
    color: "black",
    fontSize: isLandscape ? 16 : 22,
    fontWeight: "500",
  },
});
