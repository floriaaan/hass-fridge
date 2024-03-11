import { View } from "@/components/Themed";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { Image, Keyboard } from "react-native";
import {
  Button,
  HelperText,
  TextInput,
  TouchableRipple,
} from "react-native-paper";

import { useSnackbar } from "@/components/SnackBarProvider";
import { useAsyncStorage } from "@/hooks/useAsyncStorage";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  item: z.string().min(1),
  description: z.string().min(1),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format yyyy-mm-jj")
    .refine((v) => {
      const date = new Date(v);
      return date instanceof Date && !isNaN(date.getTime());
    }, "La date doit être valide"),
});

export default function ModalScreen() {
  const { id } = useLocalSearchParams();
  const [image, setImage] = useState<string | undefined>(undefined);

  const showSnackbar = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [api_url, , hasApiUrlRetrieved] = useAsyncStorage("api_url", "");
  const [token, , hasTokenRetrieved] = useAsyncStorage("token", "");
  const [entity_id, , hasEntityIdRetrieved] = useAsyncStorage("entity_id", "");
  const [entity_name, , hasENRetrieved] = useAsyncStorage("entity_name", "");

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
    !hasApiUrlRetrieved ||
    !hasTokenRetrieved ||
    !hasEntityIdRetrieved ||
    !api_url ||
    !token ||
    !entity_id;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const now = new Date().toISOString().split("T")[0];
      const isDueDatePast = new Date(values.due_date) < new Date(now);

      const res = await fetch(`${api_url}/api/services/todo/add_item`, {
        method: "POST",
        body: JSON.stringify({
          entity_id: "todo.refrigerateur",
          ...values,
          due_date: isDueDatePast ? now : values.due_date,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok)
        showSnackbar({ message: "Produit ajouté à la liste", type: "success" });

      if (isDueDatePast)
        await fetch(`${api_url}/api/services/todo/update_item`, {
          method: "POST",
          body: JSON.stringify({
            entity_id: "todo.refrigerateur",
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
        const res = await fetch(
          `https://world.openfoodfacts.org/api/v2/product/${id}`
        );
        const { product } = (await res.json()) || {};
        const {
          product_name_fr,
          product_name_en,
          product_name,
          categories,
          image_url,
        } = product || {};
        setValue("item", product_name_fr || product_name_en || product_name);

        setValue(
          "description",
          categories?.split(",").slice(0, 3).join(",") || "N/A"
        );

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
          Pour faire disparaître le clavier, appuyez sur l'image.
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
                  label={"Nom du produit"}
                  left={<TextInput.Icon icon="food" size={20} />}
                />
              )}
              name="item"
            />
            {errors.item && (
              <HelperText type="error">{errors.item.message}</HelperText>
            )}
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
                  label={"Description (optionnel)"}
                  left={<TextInput.Icon icon="text" size={20} />}
                />
              )}
              name="description"
            />
            {errors.description && (
              <HelperText type="error">{errors.description.message}</HelperText>
            )}
          </View>
          <View>
            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="Date de péremption"
                  value={value}
                  keyboardType="numeric"
                  left={<TextInput.Icon icon="calendar" size={20} />}
                  right={
                    <TextInput.Icon
                      icon="sync"
                      size={20}
                      onPress={() =>
                        onChange(new Date().toISOString().split("T")[0])
                      }
                    />
                  }
                  onBlur={onBlur}
                  onChangeText={(text: string) => {
                    if (
                      text.length > 10 &&
                      getValues("due_date").length < text.length
                    )
                      return;

                    let newText = text.replace(/\D/g, ""); // Remove all non-numeric characters
                    if (newText.length > 4)
                      newText = newText.slice(0, 4) + "-" + newText.slice(4);

                    if (newText.length > 7)
                      newText = newText.slice(0, 7) + "-" + newText.slice(7);

                    onChange(newText);
                  }}
                  placeholder="yyyy-mm-jj"
                />
              )}
              name="due_date"
            />

            {errors.due_date && (
              <HelperText type="error">{errors.due_date.message}</HelperText>
            )}
          </View>
        </View>

        <View style={{ gap: 6 }}>
          {hasErrorsWithParams ? (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <HelperText type="error" style={{ textAlign: "center" }}>
                Veuillez configurer l'URL de l'API, le token et l'identifiant de
                l'entité "Liste" dans les paramètres
              </HelperText>
              <Link href="/settings">
                <Button icon="cog-outline">Paramètres</Button>
              </Link>
            </View>
          ) : null}
          <Button
            icon={isSubmitting ? "loading" : "content-save"}
            loading={isSubmitting}
            disabled={hasErrorsWithParams || isSubmitting}
            mode={
              hasErrorsWithParams || isSubmitting
                ? "outlined"
                : "contained"
            }
            onPress={handleSubmit(onSubmit)}
          >
            Enregistrer
          </Button>
          <HelperText
            type="info"
            style={{
              textAlign: "center",
            }}
          >
            Les données seront enregistrées dans votre Home Assistant, dans
            l'entité {entity_name || entity_id || "non configurée"}
          </HelperText>
        </View>
      </View>
    </>
  );
}
