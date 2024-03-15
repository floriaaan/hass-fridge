import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Appbar, List } from "react-native-paper";

import { localesKeys } from "@/assets/locales";
import { useSnackbar } from "@/components/SnackBarProvider";
import { View } from "@/components/Themed";

export default function DeveloperScreen() {
  const { t, i18n } = useTranslation();
  const showSnackbar = useSnackbar();
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={router.back} />
        <Appbar.Content title={t("developer.title")} />
      </Appbar.Header>
      <View style={{ flex: 1, padding: 16, gap: 16, paddingBottom: 32 }}>
        <List.Section>
          <List.Subheader>{t("developer.change_language_select_label")}</List.Subheader>
          {localesKeys.map((locale) => (
            <List.Item
              title={locale}
              left={() => <List.Icon icon="translate" />}
              onPress={() => {
                i18n
                  .changeLanguage(locale)
                  .then(() => {
                    showSnackbar({
                      message: t("developer.change_language_success", { locale }),
                      type: "success",
                    });
                  })
                  .catch((error) => {
                    showSnackbar({
                      message: t("developer.change_language_error", { locale, error }),
                      type: "error",
                    });
                  });
              }}
              key={locale}
            />
          ))}
        </List.Section>
      </View>
    </>
  );
}
