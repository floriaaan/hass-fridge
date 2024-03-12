import { StatusBar } from "expo-status-bar";
import { Keyboard } from "react-native";

import { View } from "@/components/Themed";
import { useAsyncStorage } from "@/hooks/useAsyncStorage";
import { Appbar, Button, HelperText, TextInput } from "react-native-paper";

import { useSnackbar } from "@/components/SnackBarProvider";
import { useLocale } from "@/hooks/useLocale";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

export default function Settings() {
  const { t } = useLocale();

  const formSchema = z.object({
    api_url: z.string().min(1, t("settings.errors.required")),
    token: z.string().min(1, t("settings.errors.required")),
    entity_id: z.string().min(1, t("settings.errors.required")),
  });

  const showSnackbar = useSnackbar();

  const [api_url, setApiUrl, hasApiUrlRetrieved] = useAsyncStorage(
    "api_url",
    ""
  );
  const [token, setToken, hasTokenRetrieved] = useAsyncStorage("token", "");
  const [entity_id, setEntityId, hasEntityIdRetrieved] = useAsyncStorage(
    "entity_id",
    ""
  );

  const [entity_icon, setEntityIcon, hasEntityIconRetrieved] = useAsyncStorage(
    "entity_icon",
    "help"
  );

  const [entity_name, setEntityName, hasEntityNameRetrieved] = useAsyncStorage(
    "entity_name",
    ""
  );

  const [hideSecrets, setHideSecrets, hasHideSecretsRetrieved] =
    useAsyncStorage("hide_secrets", true);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      api_url,
      token,
      entity_id,
    },
  });

  useEffect(() => {
    if (hasEntityIconRetrieved) setValue("entity_id", entity_id);
    if (hasApiUrlRetrieved) setValue("api_url", api_url);
    if (hasTokenRetrieved) setValue("token", token);
    if (hasEntityIdRetrieved) setValue("entity_id", entity_id);
  }, [
    hasApiUrlRetrieved,
    hasTokenRetrieved,
    hasEntityIdRetrieved,
    hasEntityIconRetrieved,
  ]);

  const check = async ({
    api_url,
    token,
    entity_id,
  }: z.infer<typeof formSchema>) => {
    try {
      Keyboard.dismiss();
      const res = await fetch(`${api_url}/api/states/${entity_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const body = await res.json();
        setApiUrl(api_url);
        setToken(token);
        setEntityId(entity_id);
        setEntityIcon(body.attributes.icon.split(":")[1]);
        setEntityName(body.attributes.friendly_name);

        showSnackbar({
          // message: `Connection successful to ${api_url}`,
          message: t("settings.success.check_connection", { api_url }),
          type: "success",
        });
      } else
        showSnackbar({
          message: t("settings.errors.check_connection", {
            error: res.statusText,
          }),
          type: "error",
        });
    } catch (e) {
      console.error(e);
      showSnackbar({
        message: t("settings.errors.check_connection", {
          error: (e as Error).message ?? "Unknown error",
        }),
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (
      hasEntityIdRetrieved &&
      hasTokenRetrieved &&
      hasApiUrlRetrieved &&
      entity_id &&
      token &&
      api_url
    )
      check({ api_url, token, entity_id });
  }, [hasApiUrlRetrieved, hasTokenRetrieved, hasEntityIdRetrieved]);

  return (
    <>
      <StatusBar style={"auto"} />
      <Appbar.Header>
        <Appbar.Content title={t("settings.title")} />
        <Appbar.Action
          icon="information-outline"
          onPress={() => router.push("/credits")}
        />
      </Appbar.Header>
      <View
        style={{
          flex: 1,
          padding: 16,
          gap: 12,
        }}
      >
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
          <HelperText type="info">
            (example: https://my-ha-instance.com)
          </HelperText>
          {errors.api_url && (
            <HelperText type="error">{errors.api_url.message}</HelperText>
          )}
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
                left={<TextInput.Icon icon="key" size={20} />}
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
          {errors.token && (
            <HelperText type="error">{errors.token.message}</HelperText>
          )}
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

          {errors.entity_id && (
            <HelperText type="error">{errors.entity_id.message}</HelperText>
          )}
        </View>
        <Button icon="check" mode="contained" onPress={handleSubmit(check)}>
          {t("settings.check_connection_button_label")}
        </Button>
        <Button
          icon={hideSecrets ? "eye-off" : "eye"}
          mode="contained-tonal"
          onPress={() => setHideSecrets(!hideSecrets)}
        >
          {hideSecrets
            ? t("settings.show_secrets_button_label")
            : t("settings.hide_secrets_button_label")}
        </Button>
      </View>
    </>
  );
}
