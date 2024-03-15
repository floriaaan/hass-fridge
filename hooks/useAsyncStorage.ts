import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

type StorageState<T> = {
  data: T;
  retrievedFromStorage: boolean;
};

export function useAsyncStorage<T = unknown>(key: string, initialValue: T) {
  const [state, setState] = useState<StorageState<T>>({
    data: initialValue,
    retrievedFromStorage: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const value = await AsyncStorage.getItem(key);
        setState({
          data: value ? JSON.parse(value) : initialValue,
          retrievedFromStorage: true,
        });
      } catch (error) {
        console.error("useAsyncStorage getItem error:", error);
      }
    })();
  }, [key, initialValue]);

  const setNewData = async (value: T) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      setState((prevState) => ({
        ...prevState,
        data: value,
      }));
    } catch (error) {
      console.error("useAsyncStorage setItem error:", error);
    }
  };

  return [state.data, setNewData, state.retrievedFromStorage] as [T, (value: T) => Promise<void>, boolean];
}
