import { FormattableString } from "gramio";
import type {
	GetValueNested,
	LanguageMap,
	LanguagesMap,
	LocaleItem,
	NestedKeysDelimited,
	SoftString,
} from "./types.js";

function buildLanguage(languageRaw: LanguageMap) {
	const texts: Record<string, LocaleItem> = {};

	function recursiveAdd(textsRaw: LanguageMap, prefix = "") {
		for (const [key, value] of Object.entries(textsRaw)) {
			const newPrefix = `${prefix}${key}`;

			if (typeof value === "object" && !(value instanceof FormattableString)) {
				recursiveAdd(value, `${newPrefix}.`);
			} else {
				texts[newPrefix] = value;
			}
		}
	}

	recursiveAdd(languageRaw);

	return texts;
}

export function buildT<
	Languages extends LanguagesMap,
	PrimaryLanguage extends keyof Languages,
>(languages: Languages, primaryLanguage: PrimaryLanguage) {
	// @ts-expect-error sorry
	const languagesTexts: Record<
		keyof Languages,
		Record<string, LocaleItem>
	> = {};

	for (const [language, texts] of Object.entries(languages)) {
		// @ts-expect-error
		languagesTexts[language] = buildLanguage(texts);
	}

	return function t<
		Language extends SoftString<keyof Languages>,
		Key extends Language extends keyof Languages
			? NestedKeysDelimited<Languages[Language]>
			: NestedKeysDelimited<Languages[PrimaryLanguage]>,
		Item extends Language extends keyof Languages
			? GetValueNested<Languages[Language], Key>
			: GetValueNested<Languages[PrimaryLanguage], Key>,
		FallbackItem extends GetValueNested<Languages[PrimaryLanguage], Key>,
	>(
		language: Language,
		key: Key,
		...args: [Item] extends [never]
			? // @ts-expect-error
				ExtractArgsParams<FallbackItem>
			: // @ts-expect-error
				ExtractArgsParams<Item>
		// @ts-expect-error
	): ExtractItemValue<Item, FallbackItem> {
		const fallbackItem = languagesTexts[primaryLanguage][key];

		const item = languagesTexts[language]
			? (languagesTexts[language][key] ?? fallbackItem)
			: fallbackItem;

		// @ts-expect-error trust me bro
		if (typeof item === "function") return item(...args);

		return item;
	};
}
