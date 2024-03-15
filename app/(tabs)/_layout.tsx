import FontAwesome from "@expo/vector-icons/FontAwesome";
import { CommonActions } from "@react-navigation/native";
import { Tabs, router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "react-native";
import { BottomNavigation } from "react-native-paper";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { colors } from "@/constants/colors";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>["name"]; color: string }) {
  return <FontAwesome size={24} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const [counter, setCounter] = useState(0);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors[colorScheme ?? "light"].colors.primary,
        headerShown: useClientOnlyValue(false, true),
      }}
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              preventDefault();
            } else {
              navigation.dispatch({
                ...CommonActions.navigate(route.name, route.params),
                target: state.key,
              });
            }
          }}
          renderIcon={({ route, focused, color }) => {
            const { options } = descriptors[route.key];
            if (options.tabBarIcon) {
              return options.tabBarIcon({ focused, color, size: 24 });
            }

            return null;
          }}
          getLabelText={({ route }) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                  ? options.title
                  : // @ts-expect-error - we know it's a string
                    route.title;

            return label;
          }}
        />
      )}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.scanner"),
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="barcode" color={color} />,
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: t("tabs.product_list"),
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        listeners={{
          tabPress: (e) => {
            setCounter((prev) => prev + 1);
            if (!(counter >= 4)) return;

            e.preventDefault();
            setCounter(0);
            router.push("/developer");
          },
        }}
        options={{
          title: t("tabs.settings"),
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
