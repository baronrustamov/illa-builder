/* eslint-disable import/no-named-as-default-member */
import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"
import enUS from "./locale/en-US.json"
import zhCN from "./locale/zh-CN.json"
import jaJP from "./locale/ja-JP.json"
import koKR from "./locale/ko-KR.json"

export const resources = {
  "en-US": {
    translation: enUS,
  },
  "zh-CN": {
    translation: zhCN,
  },
  "ja-JP": {
    translation: jaJP,
  },
  "ko-KR": {
    translation: koKR,
  },
} as const

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en_US",
    debug: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources,
  })

export default i18n
