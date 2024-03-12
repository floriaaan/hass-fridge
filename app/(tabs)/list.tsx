import { StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { StatusBar } from "expo-status-bar";
import { Appbar } from "react-native-paper";

export default function ProductList() {
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Product list" />
      </Appbar.Header>
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
