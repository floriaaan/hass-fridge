import "../libs/locale";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Theme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";

import { SnackbarProvider } from "@/components/SnackBarProvider";
import { colors } from "@/constants/colors";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = { initialRouteName: "(tabs)" };

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({ ...FontAwesome.font });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colors[colorScheme || "light"] as unknown as Theme}>
      <PaperProvider theme={colors[colorScheme || "light"]}>
        <SnackbarProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="(product)/modal/[id]"
              options={{
                presentation: "modal",
                headerTitle: t("add_item.title"),
              }}
            />
            <Stack.Screen
              name="credits"
              options={{
                presentation: "modal",
                headerTitle: "Credits",
              }}
            />
            <Stack.Screen name="developer" options={{ headerShown: false }} />
          </Stack>
        </SnackbarProvider>
      </PaperProvider>
    </ThemeProvider>
  );
}
