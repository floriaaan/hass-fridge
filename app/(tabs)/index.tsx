import { useIsFocused } from "@react-navigation/native";
import { BarcodeScanningResult, Camera, CameraView } from "expo-camera";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Text, View } from "react-native";
import { AnimatedFAB } from "react-native-paper";

export default function Scanner() {
  const { t } = useTranslation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    setScanned(true);
    router.push(`/modal/${data}`);
  };

  if (hasPermission === null) return <Text>{t("scanner.requesting_permission")}</Text>;

  if (hasPermission === false) return <Text>{t("scanner.no_camera_permission")}</Text>;

  return (
    <View style={{ flex: 1 }}>
      {isFocused && (
        <>
          {Platform.OS !== "web" && (
            <CameraView
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: [
                  "aztec",
                  "ean13",
                  "ean8",
                  "qr",
                  "pdf417",
                  "upc_e",
                  "datamatrix",
                  "code39",
                  "code93",
                  "itf14",
                  "codabar",
                  "code128",
                  "upc_a",
                ],
              }}
              style={{ width: "100%", height: "100%" }}
            />
          )}
          {Platform.OS === "web" && <Text>{t("scanner.web_not_supported")}</Text>}
        </>
      )}
      {scanned && (
        <AnimatedFAB
          icon="plus"
          label={t("scanner.scan_again_button_label")}
          visible
          extended
          onPress={() => setScanned(false)}
          style={{ bottom: 16, right: 16, position: "absolute" }}
        />
      )}
    </View>
  );
}
