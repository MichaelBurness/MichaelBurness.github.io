import { Config, URL } from "./config";
import { ITranslationDictionary } from "./interfaces";

// Constants

let defaultLang = "en";
const langKey = "lang";

// Read language from local storage

if (localStorage) {
	const lang = localStorage.getItem(langKey);
	if (lang) defaultLang = lang;
}

// Utility functions

let i18n: { [lang: string]: ITranslationDictionary; } | null = null;

export function switchLanguage(lang: string)
{
	if (!i18n) {
		// Dictionary not yet loaded
		Config.lang = "NOTLOADED";
		Config.i18n = {};
		return;
	}

	// Default for unknown language
	if (!i18n[lang]) lang = defaultLang;

	// Set new language
	Config.lang = lang;
	Config.i18n = i18n[lang];

	// Store in local storage
	if (localStorage) localStorage.setItem(langKey, lang);

	console.log(`Language switched to [${lang}]`);
}

// Load dictionary

(async function()
{
	const resp = await fetch(URL.i18n);
	i18n = (await resp.json());
	console.debug("Translation file loaded:", i18n);

	switchLanguage(Config.lang);

	// Manually trigger change detection since the fetch API works outside of Angular's zone
	if (Config.appRef) Config.appRef.tick();
})();
