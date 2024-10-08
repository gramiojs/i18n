import type {
	ExtractArgsParams,
	ExtractItemValue,
	LanguagesMap,
	SoftString,
} from "./types.js";

export * from "./types.js";

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
	// TODO: вынести из скоупа
	function t<
		Language extends SoftString<keyof Languages>,
		Key extends Language extends keyof Languages
			? keyof Languages[Language]
			: keyof Languages[PrimaryLanguage],
		Item extends Language extends keyof Languages
			? // @ts-expect-error
				Languages[Language][Key]
			: // @ts-expect-error
				Languages[PrimaryLanguage][Key],
		// @ts-expect-error trust me bro
		FallbackItem extends Languages[PrimaryLanguage][Key],
	>(
		language: Language,
		key: Key,
		...args: Item extends unknown
			? ExtractArgsParams<FallbackItem>
			: ExtractArgsParams<Item>
	): ExtractItemValue<Item, FallbackItem> {
		// @ts-expect-error trust me bro
		const fallbackItem = languages[primaryLanguage][key];
		console.log(languages[primaryLanguage], primaryLanguage);

		const item = languages[language]
			? // @ts-expect-error
				(languages[language][key] ?? fallbackItem)
			: fallbackItem;

		// @ts-expect-error trust me bro
		if (typeof item === "function") return item(...args);

		return item;
	}

	return {
		t,
		languages: Object.keys(languages) as (keyof Languages)[],
		primaryLanguage,
		buildT: <Language extends SoftString<keyof Languages>>(
			language: Language,
		) => {
			return <
				Key extends Language extends keyof Languages
					? keyof Languages[Language]
					: keyof Languages[PrimaryLanguage],
				Item extends Language extends keyof Languages
					? // @ts-expect-error trust me bro
						Languages[Language][Key]
					: // @ts-expect-error trust me bro
						Languages[PrimaryLanguage][Key],
				// @ts-expect-error trust me bro
				FallbackItem extends Languages[PrimaryLanguage][Key],
			>(
				key: Key,
				...args: Item extends unknown
					? ExtractArgsParams<FallbackItem>
					: ExtractArgsParams<Item>
			): ExtractItemValue<Item, FallbackItem> => t(language, key, ...args);
		},
		// plugin: () => {},
	};
}
