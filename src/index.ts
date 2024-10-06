import type {
	ExtractArgsParams,
	ExtractItemValue,
	LanguagesMap,
	SoftString,
} from "./types.js";

export * from "./types.js";
export * from "./fluent/index.js";

export interface I18nOptions<
	Languages extends LanguagesMap,
	PrimaryLanguage extends keyof Languages,
> {
	languages: Languages;
	primaryLanguage: PrimaryLanguage;
}

export function defineI18n<
	Languages extends LanguagesMap,
	PrimaryLanguage extends keyof Languages,
>({ languages, primaryLanguage }: I18nOptions<Languages, PrimaryLanguage>) {
	return {
		t: <
			Language extends SoftString<keyof Languages>,
			Key extends keyof Languages[Language],
			Item extends Languages[Language][Key],
			// @ts-expect-error trust me bro
			FallbackItem extends Languages[PrimaryLanguage][Key],
		>(
			language: Language,
			key: Key,
			...args: ExtractArgsParams<Item>
		): ExtractItemValue<Item, FallbackItem> => {
			// @ts-expect-error trust me bro
			const fallbackItem = languages[primaryLanguage][key];
			console.log(languages[primaryLanguage], primaryLanguage);

			const item = languages[language]
				? (languages[language][key] ?? fallbackItem)
				: fallbackItem;

			// @ts-expect-error trust me bro
			if (typeof item === "function") return item(...args);

			return item;
		},
		languages: Object.keys(languages) as (keyof Languages)[],
		primaryLanguage,
		// plugin: () => {},
	};
}
