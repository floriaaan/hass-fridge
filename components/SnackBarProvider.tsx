import React, { ReactNode, createContext, useContext, useState } from "react";
import { Snackbar } from "react-native-paper";

interface SnackbarContextValue {
  (msg: SnackbarMessage): void;
}

type SnackbarMessage = {
  message: string;
  type: "success" | "error" | "info" | "warning";
};

const SnackbarContext = createContext<SnackbarContextValue | undefined>(
  undefined
);

interface SnackbarProviderProps {
  children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<
    "success" | "error" | "info" | "warning" | null
  >(null);

  const showSnackbar: SnackbarContextValue = ({
    message,
    type,
  }: SnackbarMessage) => {
    setMessage(message);
    setType(type);
    setVisible(true);
  };

  const hideSnackbar = () => {
    setVisible(false);
  };

  return (
    <SnackbarContext.Provider value={showSnackbar}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={hideSnackbar}
        duration={Snackbar.DURATION_SHORT}
        theme={{
          colors: {
            surface:
              type === "error"
                ? "red"
                : type === "success"
                ? "green"
                : undefined,
          },
        }}
        icon={
          type === "error"
            ? "alert-circle"
            : type === "success"
            ? "check"
            : undefined
        }
      >
        {message}
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = (): SnackbarContextValue => {
  const showSnackbar = useContext(SnackbarContext);
  if (!showSnackbar) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return showSnackbar;
};
