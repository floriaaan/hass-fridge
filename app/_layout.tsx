import "../libs/locale";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Theme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "react-native";
import { IconButton } from "react-native-paper";

import { SnackbarProvider } from "@/components/SnackBarProvider";
import { colors } from "@/resources/colors";

export { ErrorBoundary } from "expo-router";

import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "@/providers/paper-provider";
export const unstable_settings = { initialRouteName: "(tabs)" };

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({ ...FontAwesome.font });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    
    if (loaded) SplashScreen.hideAsync()
  }, [loaded]);

  if (!loaded) return null;
  return (
    // <NavigationContainer>
      <RootLayoutNav />
    // </NavigationContainer>
  );
}

function RootLayoutNav() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
    const themeKey = (colorScheme ?? "light") as "light" | "dark";


  return (
    <ThemeProvider value={colors[themeKey] as unknown as Theme}>
      <PaperProvider>
        <SnackbarProvider>
          <Stack >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal/(product)/[id]"
              options={{
                presentation: "modal",
                headerTitle: t("add_item.title"),
              }}
            />
            <Stack.Screen
              name="modal/recipe-generator"
              options={{
                headerStyle: {
                  backgroundColor: colors[themeKey].colors.surface,
                },
                headerTitleStyle: {
                  color: colors[themeKey].colors.onSurface,
                },
                presentation: "modal",
                headerTitle: t("recipe_generator.title"),
                headerRight: () => <IconButton icon="cog"></IconButton>,
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
