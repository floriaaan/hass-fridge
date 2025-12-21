import { colors } from "@/resources/colors";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { adaptNavigationTheme, MD3DarkTheme, MD3LightTheme, Provider, ProviderProps } from "react-native-paper";

export function PaperProvider({ children, ...otherProps }: ProviderProps) {
  const colorScheme = useColorScheme();
  const themeKey = (colorScheme ?? "light") as "light" | "dark";
  const { LightTheme, DarkTheme } = adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
    materialDark: MD3DarkTheme,
    materialLight: MD3LightTheme,
  });
  const paperTheme =
    themeKey === "dark"
      ? {
          ...MD3DarkTheme,
          ...DarkTheme,
          colors: { ...MD3DarkTheme.colors, ...DarkTheme.colors, ...colors.dark.colors },
          fonts: { ...MD3DarkTheme.fonts, ...NavigationDarkTheme.fonts },
        }
      : {
          ...MD3LightTheme,
          ...LightTheme,
          colors: { ...MD3LightTheme.colors, ...LightTheme.colors, ...colors.light.colors },
          fonts: { ...MD3LightTheme.fonts, ...NavigationDefaultTheme.fonts },
        };

  return (
    <Provider theme={paperTheme} {...otherProps}>
      <NavigationThemeProvider value={paperTheme}>{children}</NavigationThemeProvider>
    </Provider>
  );
}
