import { derived } from "svelte/store";
import { init, register, dictionary, locale, _ } from "svelte-i18n";
import { config } from "~/config";

const MESSAGE_FILE_URL_TEMPLATE = "/lang/{locale}.json";

let cachedLocale;

register("en", () => import("./en.json"));
register("fr", () => import("./fr.json"));

init({
  // fallback to english if the current locale is not in the dictionary
  fallbackLocale: "en",

  // Default locale/language, if available
  initialLocale: config.langDefault,
});

function setupI18n(
  { withLocale: _locale } = { withLocale: config.langDefault }
) {
  const messsagesFileUrl = MESSAGE_FILE_URL_TEMPLATE.replace(
    "{locale}",
    _locale
  );

  return fetch(messsagesFileUrl)
    .then((response) => response.json())
    .then((messages) => {
      dictionary.set({ [_locale]: messages });

      cachedLocale = _locale;

      locale.set(_locale);
    });
}

// Tag languages as left-to-right or right-to-left
const dir = derived(locale, ($locale) => ($locale === "ar" ? "rtl" : "ltr"));

export { _, locale, dir, setupI18n };
