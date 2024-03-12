import { View } from "@/components/Themed";
import { useLocale } from "@/hooks/useLocale";
import { router } from "expo-router";
import { Appbar } from "react-native-paper";

export default function DevelopperScreen() {
  const { t } = useLocale();
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={router.back} />
        <Appbar.Content title={t("developer.title")} />
        
      </Appbar.Header>
      <View style={{ flex: 1, padding: 16, gap: 16, paddingBottom: 32 }}></View>
    </>
  );
}
