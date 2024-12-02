import type {
	ExtractArgsParams,
	ExtractItemValue,
	GetValueNested,
	I18nOptions,
	LanguagesMap,
	NestedKeysDelimited,
	SoftString,
} from "./types.js";
import { buildT } from "./utils.js";

export * from "./types.js";

export function defineI18n<
	Languages extends LanguagesMap,
	PrimaryLanguage extends keyof Languages,
>({ languages, primaryLanguage }: I18nOptions<Languages, PrimaryLanguage>) {
	const t = buildT(languages, primaryLanguage);

	return {
		t,
		languages: Object.keys(languages) as (keyof Languages)[],
		primaryLanguage,
		buildT: <Language extends SoftString<keyof Languages>>(
			language: Language,
		) => {
			return <
				Key extends Language extends keyof Languages
					? NestedKeysDelimited<Languages[Language]>
					: NestedKeysDelimited<Languages[PrimaryLanguage]>,
				Item extends Language extends keyof Languages
					? GetValueNested<Languages[Language], Key>
					: GetValueNested<Languages[PrimaryLanguage], Key>,
				FallbackItem extends GetValueNested<Languages[PrimaryLanguage], Key>,
			>(
				key: Key,
				...args: Item extends unknown
					? // @ts-expect-error
						ExtractArgsParams<FallbackItem>
					: // @ts-expect-error
						ExtractArgsParams<Item>
				// @ts-expect-error
			): ExtractItemValue<Item, FallbackItem> => t(language, key, ...args);
		},
		_: {
			languages,
			primaryLanguage,
		},
		// plugin: () => {},
	};
}
