import { useTranslation } from "react-i18next";
import { ScrollView, Touchable, TouchableOpacity } from "react-native";

import { Text, View } from "@/components/Themed";
import { useAsyncStorage } from "@/hooks/useAsyncStorage";
import { TodoItem } from "@/types/TodoItem";
import { useEffect, useState } from "react";
import { getCompletion } from "@/libs/ai/completion";
import { buildPrompt } from "@/libs/ai/prompt";
import { Button } from "react-native-paper";

export default function RecipeGenerator() {
  const { t, i18n } = useTranslation();

  const [products] = useAsyncStorage<TodoItem[]>("products", []);
  const [openai_key, , hasOpenAIKeyRetrieved] = useAsyncStorage<string>("openai_key", "");

  const [hasGenerated, setHasGenerated] = useState(false);
  const [recipe, setRecipe] = useState<string>("");

  useEffect(() => {
    if (products.length === 0 || !hasOpenAIKeyRetrieved) return;

    console.log("key", openai_key);

    // TODO; ajouter un regénérer les recettes en excluant les recettes déjà générées
    if (!hasGenerated && openai_key)
      getCompletion(openai_key, buildPrompt(products, i18n.language))
        .then((res) => {
          console.log(res);
          setRecipe(res || "No recipe generated");
          setHasGenerated(true);
        })
        .catch((err) => console.error(err));

    return () => {
      setHasGenerated(false);
    };
  }, [hasGenerated]);

  return (
    <>
      <View
        style={{
          flex: 1,
          padding: 16,
        }}
      >
        <ScrollView style={{ flex: 1, flexGrow: 1, gap: 16 }}>
          <Text>{products.length}</Text>
          <Text>{i18n.language}</Text>
          <Button onPress={() => setHasGenerated(false)}>
            <Text>Generate Recipe</Text>
          </Button>
          <Text>{hasGenerated ? "Generated" : "Not generated"}</Text>
          <Text>{recipe}</Text>
        </ScrollView>
      </View>
    </>
  );
}
