import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";

import { View } from "@/components/Themed";
import { useAsyncStorage } from "@/hooks/useAsyncStorage";
import { Button, HelperText, TextInput } from "react-native-paper";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  api_url: z.string().min(1),
  token: z.string().min(1),
  entity_id: z.string().min(1),
});

export default function Settings() {
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

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
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
        alert("Connection successful");
      } else alert("Connection failed");
    } catch (e) {
      console.error(e);
      alert("Connection failed");
    }
  };

  return (
    <>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
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
                label={"API url"}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                left={<TextInput.Icon icon="web" size={20} />}
              />
            )}
            name="api_url"
          />
          <HelperText type="info">(e.g. https://my-ha-instance.com)</HelperText>
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
                label={"Token"}
                style={{
                  height: 52,
                }}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                left={<TextInput.Icon icon="key" size={20} />}
              />
            )}
            name="token"
          />

          <HelperText type="info">
            Long lived access token from your Home Assistant instance.
          </HelperText>
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
                label={"Entity id"}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                left={<TextInput.Icon icon={entity_icon} size={20} />}
              />
            )}
            name="entity_id"
          />

          <HelperText type="info">
            The entity id of the list you want to add items to.
          </HelperText>

          {errors.entity_id && (
            <HelperText type="error">{errors.entity_id.message}</HelperText>
          )}
        </View>
        <Button
          icon="check"
          mode="contained-tonal"
          onPress={handleSubmit(check)}
        >
          Check connection
        </Button>
      </View>
    </>
  );
}
