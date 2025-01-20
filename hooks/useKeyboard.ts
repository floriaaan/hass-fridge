import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

export const useKeyboard = () => {
  const [inputBottom, setInputBottom] = useState(100);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardWillShow",
      (e) => setInputBottom(e.endCoordinates.height), // Adjust based on your needs
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardWillHide",
      () => setInputBottom(0), // Reset to default
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return { inputBottom };
};
