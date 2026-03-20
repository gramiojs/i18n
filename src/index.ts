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
export * from "./pluralize/english.js";
export * from "./pluralize/russian.js";

export function defineI18n<
	Languages extends LanguagesMap,
	PrimaryLanguage extends keyof Languages,
>({ languages, primaryLanguage }: I18nOptions<Languages, PrimaryLanguage>) {
	const t = buildT(languages, primaryLanguage);

	return {
		t,
		languages: Object.keys(languages) as (keyof Languages)[],
		primaryLanguage,
		buildT: <Language extends SoftString<keyof Languages> = PrimaryLanguage>(
			language?: Language,
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
		/**
		 * Generate a `{ languageCode: description }` record for all non-primary languages.
		 * Designed for use with `CommandMeta.locales` in `syncCommands()`.
		 *
		 * Only includes languages where the key resolves to a plain string (no args).
		 *
		 * @example
		 * ```ts
		 * bot.command("help", {
		 *     description: i18n.t("en", "cmd.help"),
		 *     locales: i18n.localesFor("cmd.help"),
		 * }, (ctx) => ctx.send("Help"));
		 * ```
		 */
		localesFor<
			Key extends NestedKeysDelimited<Languages[PrimaryLanguage]>,
		>(
			key: Key,
			...args: ExtractArgsParams<GetValueNested<Languages[PrimaryLanguage], Key>>
		): Record<string, string> {
			const result: Record<string, string> = {};
			for (const lang of Object.keys(languages)) {
				if (lang === primaryLanguage) continue;
				const value = t(lang as SoftString<keyof Languages>, key as any, ...args as any);
				if (value != null) {
					result[lang] = String(value);
				}
			}
			return result;
		},
		_: {
			languages,
			primaryLanguage,
		},
		// plugin: () => {},
	};
}
