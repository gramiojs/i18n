import type { FormattableString, SendMessageParams } from "gramio";

export type LocaleValue =
	| string
	| FormattableString
	| Omit<SendMessageParams, "chat_id">;

export type LocaleArgs<Arguments extends any[] = any[]> = (
	...args: Arguments
) => LocaleValue;

export type LocaleItem<Arguments extends any[] = any[]> =
	| LocaleArgs<Arguments>
	| LocaleValue;

export type LanguageMap = Record<string, LocaleItem>;

// export interface PrimaryLanguage {
// 	name: string;
// 	value: Record<string, LocaleItem>;
// }

export type LanguagesMap = Record<string, LanguageMap>;

export type ExtractArgsParams<Item extends LocaleItem> =
	Item extends LocaleArgs<infer Args> ? Args : [];

export type ExtractItemValue<
	Item extends LocaleItem,
	FallbackItem extends LocaleItem = never,
> = [Item] extends [never]
	? [FallbackItem] extends [never]
		? never
		: ExtractItemValue<FallbackItem>
	: Item extends LocaleArgs
		? ReturnType<Item>
		: Item;

export type ShouldFollowLanguage<Language extends LanguageMap> = {
	[Key in keyof Language]?: Language[Key];
};

export type ShouldFollowLanguageStrict<Language extends LanguageMap> = {
	[Key in keyof Language]: Language[Key];
};

export type SoftString<Strings> = Strings | ({} & string);

export interface I18nOptions<
	Languages extends LanguagesMap,
	PrimaryLanguage extends keyof Languages,
> {
	languages: Languages;
	primaryLanguage: PrimaryLanguage;
}

export type ExtractLanguages<T> = T extends {
	_: { languages: infer Languages };
}
	? Languages
	: never;
