import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Image, Keyboard } from "react-native";
import { Button, HelperText, TextInput, TouchableRipple } from "react-native-paper";
import { z } from "zod";

import { useSnackbar } from "@/components/SnackBarProvider";
import { View } from "@/components/Themed";
import { useAsyncStorage } from "@/hooks/useAsyncStorage";

export default function AddItemScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const [image, setImage] = useState<string | undefined>(undefined);

  const showSnackbar = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [api_url, , hasApiUrlRetrieved] = useAsyncStorage("api_url", "");
  const [token, , hasTokenRetrieved] = useAsyncStorage("token", "");
  const [entity_id, , hasEntityIdRetrieved] = useAsyncStorage("entity_id", "");
  const [entity_name] = useAsyncStorage("entity_name", "");

  const formSchema = z.object({
    item: z.string().min(1, t("add_item.errors.required")),
    description: z.string(),
    due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, t("add_item.errors.due_date_format"))
      .refine((v) => {
        const date = new Date(v);
        return date instanceof Date && !isNaN(date.getTime());
      }, t("add_item.errors.due_date_invalid")),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item: "",
      description: "",
      due_date: new Date().toISOString().split("T")[0],
    },
  });
  const hasErrorsWithParams =
    !hasApiUrlRetrieved || !hasTokenRetrieved || !hasEntityIdRetrieved || !api_url || !token || !entity_id;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const now = new Date().toISOString().split("T")[0];
      const isDueDatePast = new Date(values.due_date) < new Date(now);

      // TODO: feedback on the UI
      if (!hasEntityIdRetrieved || !entity_id) return;

      const res = await fetch(`${api_url}/api/services/todo/add_item`, {
        method: "POST",
        body: JSON.stringify({
          entity_id,
          ...values,
          due_date: isDueDatePast ? now : values.due_date,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok)
        // TODO: i18n
        showSnackbar({
          message: t("add_item.success.add_item"),
          type: "success",
        });

      if (isDueDatePast)
        await fetch(`${api_url}/api/services/todo/update_item`, {
          method: "POST",
          body: JSON.stringify({
            entity_id,
            item: values.item,
            due_date: values.due_date,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

      router.dismiss();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${id}`);
        const { product } = (await res.json()) || {};
        const { product_name_fr, product_name_en, product_name, categories, image_url } = product || {};
        setValue("item", product_name_fr || product_name_en || product_name);

        setValue("description", categories?.split(",").slice(0, 3).join(",") || "N/A");

        setImage(image_url);
      } catch (e) {
        console.error(e);
      }
    };
    getData();
  }, [id]);

  return (
    <>
      <View style={{ flex: 1, padding: 16, gap: 16, paddingBottom: 32 }}>
        <HelperText
          type="info"
          style={{
            marginBottom: -16,
          }}
        >
          {t("add_item.dismiss_keyboard_helper")}
        </HelperText>
        <View style={{ flex: 1, gap: 16 }}>
          <TouchableRipple
            style={{
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            }}
            onPress={Keyboard.dismiss}
          >
            <Image
              src={image}
              style={{
                width: "40%",
                height: "auto",
                aspectRatio: "1/1",
                objectFit: "contain",
              }}
            />
          </TouchableRipple>
          <View>
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  label={t("add_item.item_label")}
                  left={<TextInput.Icon icon="food" size={20} />}
                />
              )}
              name="item"
            />
            {errors.item && <HelperText type="error">{errors.item.message}</HelperText>}
          </View>
          <View>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  label={t("add_item.description_label")}
                  left={<TextInput.Icon icon="text" size={20} />}
                />
              )}
              name="description"
            />
            {errors.description && <HelperText type="error">{errors.description.message}</HelperText>}
          </View>
          <View>
            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label={t("add_item.due_date_label")}
                  value={value}
                  keyboardType="numeric"
                  left={<TextInput.Icon icon="calendar" size={20} />}
                  right={
                    <TextInput.Icon
                      icon="sync"
                      size={20}
                      onPress={() => onChange(new Date().toISOString().split("T")[0])}
                    />
                  }
                  onBlur={onBlur}
                  onChangeText={(text: string) => {
                    if (text.length > 10 && getValues("due_date").length < text.length) return;

                    let newText = text.replace(/\D/g, ""); // Remove all non-numeric characters
                    if (newText.length > 4) newText = newText.slice(0, 4) + "-" + newText.slice(4);

                    if (newText.length > 7) newText = newText.slice(0, 7) + "-" + newText.slice(7);

                    onChange(newText);
                  }}
                  placeholder="yyyy-mm-jj"
                />
              )}
              name="due_date"
            />

            {errors.due_date && <HelperText type="error">{errors.due_date.message}</HelperText>}
          </View>
        </View>

        <View style={{ gap: 6 }}>
          {hasErrorsWithParams ? (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <HelperText type="error" style={{ textAlign: "center" }}>
                {/* TODO: i18n */}
                {t("add_item.errors.helper")}
              </HelperText>
              <Link href="/settings">
                <Button icon="cog-outline">{t("add_item.errors.helper_settings_link")}</Button>
              </Link>
            </View>
          ) : null}
          <Button
            icon={isSubmitting ? "loading" : "content-save"}
            loading={isSubmitting}
            disabled={hasErrorsWithParams || isSubmitting}
            mode={hasErrorsWithParams || isSubmitting ? "outlined" : "contained"}
            onPress={handleSubmit(onSubmit)}
          >
            {t("add_item.save_button_label")}
          </Button>
          <HelperText type="info" style={{ textAlign: "center" }}>
            {t("add_item.helper", {
              entity_id: entity_name || entity_id || "non configurée",
            })}
          </HelperText>
        </View>
      </View>
    </>
  );
}
