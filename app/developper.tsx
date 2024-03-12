import { View } from "@/components/Themed";
import { router } from "expo-router";
import { Appbar } from "react-native-paper";

export default function DevelopperScreen() {
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={router.back} />
        <Appbar.Content title="Developper" />
        
      </Appbar.Header>
      <View style={{ flex: 1, padding: 16, gap: 16, paddingBottom: 32 }}></View>
    </>
  );
}
