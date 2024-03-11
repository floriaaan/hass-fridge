import { useIsFocused } from "@react-navigation/native";
import { BarcodeScanningResult, Camera, CameraView } from "expo-camera/next";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { AnimatedFAB } from "react-native-paper";

export default function Scanner() {
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

  if (hasPermission === null)
    return <Text>Requesting for camera permission</Text>;

  if (hasPermission === false) return <Text>No access to camera</Text>;

  return (
    <View style={{ flex: 1 }}>
      {isFocused && (
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
      {scanned && (
        <AnimatedFAB
          icon={"plus"}
          label={"Tap to Scan Again"}
          extended
          onPress={() => setScanned(false)}
          visible
          style={{
            bottom: 16,
            right: 16,
            position: "absolute",
          }}
        />
      )}
    </View>
  );
}
