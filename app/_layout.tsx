import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";

import { SnackbarProvider } from "@/components/SnackBarProvider";
import { useColorScheme } from "@/components/useColorScheme";
import { LocaleProvider, useLocale } from "@/hooks/useLocale";

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
  return (
    <LocaleProvider>
      <RootLayoutNav />
    </LocaleProvider>
  );
}

function RootLayoutNav() {
  const { t } = useLocale();
  const colorScheme = useColorScheme();
  const { theme } = useMaterial3Theme();

  const paperTheme =
    colorScheme === "dark" ? { ...MD3DarkTheme, colors: theme.dark } : { ...MD3LightTheme, colors: theme.light };

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <PaperProvider theme={paperTheme}>
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
            <Stack.Screen name="developper" options={{ headerShown: false }} />
          </Stack>
        </SnackbarProvider>
      </PaperProvider>
    </ThemeProvider>
  );
}
