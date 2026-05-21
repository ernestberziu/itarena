import sqMessages from "../../../messages/sq.json";
import enMessages from "../../../messages/en.json";
import type { AppLocale } from "./server-messages";

export function getShopMessages(locale: AppLocale) {
  return locale === "en" ? enMessages : sqMessages;
}
