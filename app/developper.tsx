import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Appbar } from "react-native-paper";

import { View } from "@/components/Themed";

export default function DevelopperScreen() {
  const { t } = useTranslation();
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={router.back} />
        <Appbar.Content title={t("developer.title")} />
      </Appbar.Header>
      <View style={{ flex: 1, padding: 16, gap: 16, paddingBottom: 32 }} />
    </>
  );
}
