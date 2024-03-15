import i18n, { Resource } from "i18next";
import { initReactI18next } from "react-i18next";

import { locales } from "@/assets/locales";

type SupportedLngs = keyof typeof locales | "en";
const supportedLngs = Object.keys(locales);

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  fallbackLng: "en",
  supportedLngs,
  resources: Object.keys(locales).reduce((acc, key) => {
    acc[key] = { translation: locales[key as SupportedLngs] as Resource };
    return acc;
  }, {} as Resource),
});
