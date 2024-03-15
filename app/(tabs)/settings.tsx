import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { t } from "i18next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FlatList, Keyboard } from "react-native";
import { Appbar, Button, Chip, HelperText, TextInput } from "react-native-paper";
import { z } from "zod";

import { useSnackbar } from "@/components/SnackBarProvider";
import { Text, View } from "@/components/Themed";
import { useAsyncStorage as uAS } from "@/hooks/useAsyncStorage";

type Config = {
  api_url: string;
  token: string;
  entity_id: string;
  entity_icon: string;
  entity_name: string;
};

const formSchema = z.object({
  api_url: z.string().min(1, t("settings.errors.required")),
  token: z.string().min(1, t("settings.errors.required")),
  entity_id: z.string().min(1, t("settings.errors.required")),
});
export default function Settings() {
  const showSnackbar = useSnackbar();

  const [api_url, setApiUrl, hasApiUrlRetrieved] = uAS("api_url", "");
  const [token, setToken, hasTokenRetrieved] = uAS("token", "");
  const [entity_id, setEntityId, hasEntityIdRetrieved] = uAS("entity_id", "");
  const [entity_icon, setEntityIcon, hasEntityIconRetrieved] = uAS("entity_icon", "help");
  const [hideSecrets, setHideSecrets] = uAS("hide_secrets", true);

  const [configs, setConfigs] = uAS<Config[] | undefined>("configs", undefined);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { api_url: "", token: "", entity_id: "" },
  });

  useEffect(() => {
    if (hasEntityIconRetrieved) setValue("entity_id", entity_id);
    if (hasApiUrlRetrieved) setValue("api_url", api_url);
    if (hasTokenRetrieved) setValue("token", token);
    if (hasEntityIdRetrieved) setValue("entity_id", entity_id);
  }, [hasApiUrlRetrieved, hasTokenRetrieved, hasEntityIdRetrieved, hasEntityIconRetrieved]);

  const check = useCallback(
    async ({ api_url, token, entity_id }: z.infer<typeof formSchema>) => {
      try {
        Keyboard.dismiss();
        const res = await fetch(`${api_url}/api/states/${entity_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const {
            attributes: { icon, friendly_name },
          } = await res.json();
          setApiUrl(api_url);
          setToken(token);
          setEntityId(entity_id);
          setEntityIcon(icon.split(":")[1]);

          showSnackbar({ message: t("settings.success.check_connection", { api_url }), type: "success" });

          if (configs === undefined || configs.length === 0)
            setConfigs([{ api_url, token, entity_id, entity_icon: icon.split(":")[1], entity_name: friendly_name }]);
          else {
            // check if the config already exists (deep comparison)
            if (
              !configs.some(
                (config) => config.api_url === api_url && config.token === token && config.entity_id === entity_id,
              )
            )
              setConfigs([
                ...configs,
                { api_url, token, entity_id, entity_icon: icon.split(":")[1], entity_name: friendly_name },
              ]);
          }
        } else
          showSnackbar({ message: t("settings.errors.check_connection", { error: res.statusText }), type: "error" });
      } catch (e) {
        console.error(e);
        showSnackbar({
          message: t("settings.errors.check_connection", { error: (e as Error).message ?? "Unknown error" }),
          type: "error",
        });
      }
    },
    [api_url, configs, entity_icon, entity_id, setApiUrl, setEntityId, setEntityIcon, setToken, showSnackbar, t, token],
  );

  const renderedConfigs = useMemo(
    () =>
      (configs || []).map((item) => {
        const isSelected = item.api_url === api_url && item.token === token && item.entity_id === entity_id;
        return (
          <Chip
            style={{ marginRight: 8 }}
            mode={isSelected ? "flat" : "outlined"}
            icon={isSelected ? "check" : entity_icon}
            onPress={() => {
              setApiUrl(item.api_url);
              setToken(item.token);
              setEntityId(item.entity_id);
              setEntityIcon(item.entity_icon);

              setValue("api_url", item.api_url);
              setValue("token", item.token);
              setValue("entity_id", item.entity_id);

              showSnackbar({
                message: t("settings.success.selected_config", { entity_name: item.entity_name }),
                type: "info",
              });
            }}
            onClose={() => {
              setConfigs(
                (configs || []).filter(
                  (config) =>
                    !(
                      config.api_url === item.api_url &&
                      config.token === item.token &&
                      config.entity_id === item.entity_id
                    ),
                ),
              );
              showSnackbar({
                message: t("settings.success.removed_config", { entity_name: item.entity_name }),
                type: "info",
              });
            }}
          >
            {item.entity_name}
          </Chip>
        );
      }),
    [configs, api_url, token, entity_id],
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!mounted) setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (mounted) return;
    if (hasEntityIdRetrieved && hasTokenRetrieved && hasApiUrlRetrieved && entity_id && token && api_url)
      check({ api_url, token, entity_id });
  }, [mounted, hasApiUrlRetrieved, hasTokenRetrieved, hasEntityIdRetrieved]);

  return (
    <>
      <StatusBar style="auto" />
      <Appbar.Header>
        <Appbar.Content title={t("settings.title")} />
        <Appbar.Action icon="information-outline" onPress={() => router.push("/credits")} />
      </Appbar.Header>
      <View
        style={{
          flex: 1,
          padding: 16,
          gap: 12,
        }}
      >
        <View style={{ gap: 8 }}>
          <Text>{t("settings.saved_configs")}</Text>
          <FlatList
            horizontal
            style={{ flexGrow: 0, marginBottom: 16 }}
            data={renderedConfigs}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => item}
            ListEmptyComponent={<HelperText type="info">{t("settings.no_saved_configs")}</HelperText>}
          />
        </View>
        <View>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                mode="outlined"
                label={t("settings.api_url_label")}
                value={value}
                keyboardType="url"
                autoComplete="url"
                onBlur={onBlur}
                onChangeText={onChange}
                left={<TextInput.Icon icon="web" size={20} />}
                right={
                  value.trim().length && (
                    <TextInput.Icon
                      icon="delete"
                      size={20}
                      onPress={() => {
                        setValue("api_url", "");
                        setApiUrl("");
                      }}
                    />
                  )
                }
                secureTextEntry={hideSecrets}
              />
            )}
            name="api_url"
          />
          <HelperText type="info">(example: https://my-ha-instance.com)</HelperText>
          {errors.api_url && <HelperText type="error">{errors.api_url.message}</HelperText>}
        </View>

        <View>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                mode="outlined"
                label={t("settings.token_label")}
                style={{
                  height: 52,
                }}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                autoComplete="off"
                autoCapitalize="none"
                left={<TextInput.Icon icon="key" size={20} style={{ marginTop: 16 }} />}
                right={
                  value.trim().length && (
                    <TextInput.Icon
                      icon="delete"
                      size={20}
                      onPress={() => {
                        setValue("token", "");
                        setToken("");
                      }}
                    />
                  )
                }
                secureTextEntry={hideSecrets}
              />
            )}
            name="token"
          />

          <HelperText type="info">{t("settings.token_helper")}</HelperText>
          {errors.token && <HelperText type="error">{errors.token.message}</HelperText>}
        </View>

        <View>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                mode="outlined"
                label={t("settings.entity_id_label")}
                value={value}
                autoComplete="off"
                // remove auto uppercase
                autoCapitalize="none"
                onBlur={onBlur}
                onChangeText={onChange}
                left={<TextInput.Icon icon={entity_icon} size={20} />}
                right={
                  value.trim().length && (
                    <TextInput.Icon
                      icon="delete"
                      size={20}
                      onPress={() => {
                        setValue("entity_id", "");
                        setEntityId("");
                        setEntityIcon("help");
                      }}
                    />
                  )
                }
              />
            )}
            name="entity_id"
          />

          <HelperText type="info">{t("settings.entity_id_helper")}</HelperText>

          {errors.entity_id && <HelperText type="error">{errors.entity_id.message}</HelperText>}
        </View>
        <Button icon="check" mode="contained" onPress={handleSubmit(check)}>
          {t("settings.check_connection_button_label")}
        </Button>
        <Button
          icon={hideSecrets ? "eye-off" : "eye"}
          mode="contained-tonal"
          onPress={() => setHideSecrets(!hideSecrets)}
        >
          {hideSecrets ? t("settings.show_secrets_button_label") : t("settings.hide_secrets_button_label")}
        </Button>
      </View>
    </>
  );
}
