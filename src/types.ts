import type { FormattableString, SendMessageParams } from "gramio";

type Values<T> = T[keyof T];
type SafeGet<T, K extends string> = T extends Record<K, unknown> ? T[K] : never;

export type LocaleValue = string | FormattableString;
// | Omit<SendMessageParams, "chat_id">;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type LocaleArgs<Arguments extends any[] = any[]> = (
	...args: Arguments
) => LocaleValue;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type LocaleItem<Arguments extends any[] = any[]> =
	| LocaleArgs<Arguments>
	| LocaleValue;

export interface LanguageMap {
	[key: string]: LocaleItem | LanguageMap;
}

export type NestedKeysDelimited<T> = Values<{
	[key in Extract<keyof T, string>]: T[key] extends LocaleItem
		? key
		: `${key}.${T[key] extends infer R ? NestedKeysDelimited<R> : never}`;
}>;

// TODO: calculate nested keys once on `defineI18n`
export type GetValueNested<
	T,
	K extends string,
> = K extends `${infer P}.${infer Q}`
	? GetValueNested<SafeGet<T, P>, Q>
	: SafeGet<T, K>;

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
