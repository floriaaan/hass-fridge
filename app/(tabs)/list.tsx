import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import { Appbar, FAB } from "react-native-paper";

import { Text, View } from "@/components/Themed";
import { useAsyncStorage } from "@/hooks/useAsyncStorage";
import { useEffect } from "react";
import { TodoItem } from "@/types/TodoItem";
import { router } from "expo-router";

export default function ProductList() {
  const { t } = useTranslation();
  const [api_url, , hasApiUrlRetrieved] = useAsyncStorage("api_url", "");
  const [token, , hasTokenRetrieved] = useAsyncStorage("token", "");
  const [entity_id, , hasEntityIdRetrieved] = useAsyncStorage("entity_id", "");

  const [products, setProducts] = useAsyncStorage<TodoItem[]>("products", []);

  const fetchData = async () => {
    if (!(hasApiUrlRetrieved && hasTokenRetrieved && hasEntityIdRetrieved && api_url && token && entity_id)) return;

    try {
      const res = await fetch(`${api_url}/api/services/todo/get_items?return_response`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ entity_id }),
      });
      const data = await res.json();

      if (data?.service_response?.[entity_id]?.items) setProducts(data.service_response[entity_id].items);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [api_url, token, entity_id]);

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title={t("product_list.title")} />
      </Appbar.Header>
      <StatusBar style="auto" />
      <View
        style={{
          flex: 1,
          padding: 16,
        }}
      >
        <ScrollView style={{ flex: 1, flexGrow: 1, gap: 16 }}>
          <Text>{JSON.stringify(products, null, 2)}</Text>
        </ScrollView>
        <FAB
          icon="magic-staff"
          onPress={() => router.push(`/modal/recipe-generator`)}
          visible
          style={{ bottom: 16, right: 16, position: "absolute" }}
        />
      </View>
    </>
  );
}
