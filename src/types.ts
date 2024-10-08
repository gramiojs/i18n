import type { FormattableString } from "gramio";

export type LocaleValue = string | FormattableString;

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
	FallbackItem extends LocaleItem,
> = Item extends never | undefined | unknown
	? FallbackItem
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
