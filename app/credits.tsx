import { FontAwesome6 } from "@expo/vector-icons";
import { Link } from "expo-router";

import { Text, View } from "@/components/Themed";

export default function CreditsScreen() {
  return (
    <>
      <View style={{ flex: 1, padding: 16, gap: 16, paddingBottom: 32 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Credits</Text>
        <View style={{ gap: 8 }}>
          <Text>
            The app is open-source and available on{" "}
            <Link
              href="https://github.com/floriaaan/hass-fridge"
              target="_blank"
              style={{
                textDecorationColor: "blue",
                textDecorationLine: "underline",
                color: "blue",
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <FontAwesome6 name="github" size={16} />
              GitHub
            </Link>
          </Text>
          <Text>
            This app is powered by{" "}
            <Link
              style={{
                textDecorationColor: "blue",
                textDecorationLine: "underline",
                color: "blue",
              }}
              href="https://world.openfoodfacts.org/"
              target="_blank"
            >
              Open Food Facts
            </Link>
            for the product data.
          </Text>

          <Text>
            This app also uses services from{" "}
            <Link
              style={{
                textDecorationColor: "blue",
                textDecorationLine: "underline",
                color: "blue",
              }}
              href="https://www.home-assistant.io/"
              target="_blank"
            >
              Home Assistant Core
            </Link>
          </Text>
          <Text>
            Developed by{" "}
            <Link
              style={{
                textDecorationColor: "blue",
                textDecorationLine: "underline",
                color: "blue",
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
              href="https://github.com/floriaaan"
              target="_blank"
            >
              <FontAwesome6 name="github" size={16} />
              Florian Leroux (floriaaan)
            </Link>
          </Text>
        </View>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Maintainers and contributors</Text>
        <View style={{ gap: 8 }}>
          <Text>
            <Link
              style={{
                textDecorationColor: "blue",
                textDecorationLine: "underline",
                color: "blue",
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
              href="https://github.com/floriaaan"
              target="_blank"
            >
              <FontAwesome6 name="github" size={16} />
              Florian Leroux (floriaaan)
            </Link>
          </Text>
        </View>
      </View>
    </>
  );
}
