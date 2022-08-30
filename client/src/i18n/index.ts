import { derived } from "svelte/store";
import {
  init,
  register,
  locale,
  dictionary,
  addMessages,
  _,
} from "svelte-i18n";
import { getLocaleFromNavigator } from "svelte-i18n";

import en from "./en.json";

// Synchronously add default 'en' locale, so that a fallback
// translation is always available
addMessages("en", en);

// Asynchronously add other languages, loaded on demand
register("fr", () => import("./fr.json"));
register("zh-Hans", () => import("./zh-Hans.json"));

init({
  // fallback to english if the current locale is not in the dictionary
  fallbackLocale: "en",

  // Default locale/language, if available
  initialLocale: getLocaleFromNavigator(),
});

// Tag languages as left-to-right or right-to-left
const dir = derived(locale, ($locale) => ($locale === "ar" ? "rtl" : "ltr"));

locale.subscribe(($locale) => {
  console.log("i18n locale", $locale);
});

(window as any).dictionary = dictionary;

export { _, locale, dir };
