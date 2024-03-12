import * as L from "expo-localization";
import { I18n } from "i18n-js";
import { ReactNode, createContext, useContext, useState } from "react";

import { defaultLocale, locales } from "@/assets/locales";

const i18n = new I18n(locales);
i18n.enableFallback = true;
i18n.defaultLocale = defaultLocale || "en";

const LocaleContext = createContext({ i18n, t: i18n.t });

export function useLocale() {
  const c = useContext(LocaleContext);
  if (!c) throw new Error("useLocale must be used within a LocaleProvider");
  return c;
}

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale] = useState(L.getLocales()[0].languageCode || defaultLocale);
  i18n.locale = locale;

  return <LocaleContext.Provider value={{ i18n, t: i18n.t }}>{children}</LocaleContext.Provider>;
};
