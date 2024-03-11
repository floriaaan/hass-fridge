import { View } from "@/components/Themed";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { Image } from "react-native";
import { Button, HelperText, Snackbar, TextInput } from "react-native-paper";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  item: z.string().min(1),
  description: z.string().min(1),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export default function ModalScreen() {
  const { id } = useLocalSearchParams();
  const [image, setImage] = useState<string | undefined>(undefined);
  const [sb_visible, setSB_Visible] = useState(false);

  const onDismissSnackBar = () => setSB_Visible(false);

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
      due_date: "",
    },
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log(values);
      const res = await fetch(
        `${"http://192.168.1.105:8123"}/api/services/todo/add_item`,
        {
          method: "POST",
          body: JSON.stringify({
            entity_id: "todo.refrigerateur",
            ...values,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_HASS_TOKEN}`,
          },
        }
      );

      if (res.ok) setSB_Visible(true);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const getData = async () => {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${id}`
      );
      const json = await res.json();
      setValue(
        "item",
        json.product?.product_name_fr ||
          json.product?.product_name_en ||
          json.product?.product_name
      );

      setValue(
        "description",
        json.product?.categories.split(",").slice(0, 3).join(",") || "N/A"
      );

      setImage(json.product?.image_url);
    };
    getData();
  }, [id]);

  return (
    <>
      <View style={{ flex: 1, padding: 16, gap: 16, paddingBottom: 32 }}>
        <View style={{ flex: 1, gap: 16 }}>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <Image
              src={image}
              style={{ width: "40%", height: "auto", aspectRatio: "1/1" }}
            />
          </View>
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
                left={<TextInput.Icon icon="food" />}
              />
            )}
            name="item"
          />
          {errors.item && (
            <HelperText type="error">{errors.item.message}</HelperText>
          )}
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                mode="outlined"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                label={"Description"}
                left={<TextInput.Icon icon="text" />}
              />
            )}
            name="description"
          />
          {errors.description && (
            <HelperText type="error">{errors.description.message}</HelperText>
          )}
          <Controller
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                mode="outlined"
                label="Date de péremption"
                value={value}
                keyboardType="numeric"
                left={<TextInput.Icon icon="calendar" />}
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

        <Button
          icon="content-save"
          mode="contained-tonal"
          onPress={handleSubmit(onSubmit)}
        >
          Enregistrer
        </Button>
      </View>
      <Snackbar
        visible={sb_visible}
        onDismiss={onDismissSnackBar}
        action={{
          label: "Annuler",
          onPress: () => {
            // Do something
          },
        }}
      >
        Produit enregistré avec succès
      </Snackbar>
    </>
  );
}
