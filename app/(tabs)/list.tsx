import { StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { StatusBar } from "expo-status-bar";

export default function ProductList() {
  return (
    <>
      <StatusBar style={"auto"} />
      <View style={styles.container}>
        <Text style={styles.title}>Currently unavailable</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
