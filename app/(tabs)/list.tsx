import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { Appbar } from "react-native-paper";

import { Text, View } from "@/components/Themed";
import { useLocale } from "@/hooks/useLocale";

export default function ProductList() {
  const { t } = useLocale();
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title={t("product_list.title")} />
      </Appbar.Header>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <Text style={styles.title}>{t("product_list.unavailable")}</Text>
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
