/**
 * @module
 * `i18n` fluent plugin for [GramIO](https://gramio.dev/).
 */
import type {
	FluentBundle,
	FluentVariable,
	// @ts-ignore
} from "@fluent/bundle";
import { Plugin } from "gramio";
import {
	type I18nFluentClient,
	type I18nFluentClientOptions,
	getFluentClient,
} from "./client.js";

export * from "./client.js";

/**
 * This plugin provide internationalization for your bots with [Fluent](https://projectfluent.org/) syntax.
 * @example
 * ```ts
 * import { Bot } from "gramio";
 * import { i18n } from "@gramio/i18n";
 *
 * const bot = new Bot(process.env.BOT_TOKEN as string)
 *     .extend(i18n())
 *     .command("start", async (context) => {
 *         return context.send(
 *             context.t("shared-photos", {
 *                 userName: "Anna",
 *                 userGender: "female",
 *                 photoCount: 3,
 *             })
 *         );
 *     })
 *     .onError(console.error)
 *     .onStart(console.log);
 *
 * bot.start();
 * ```
 */
export function i18n<Bundle extends FluentBundle = FluentBundle>(
	options?: I18nFluentClientOptions | I18nFluentClient<Bundle>,
	// Temporally fix slow types
): Plugin<
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	{},
	import("gramio").DeriveDefinitions & {
		global: {
			/** Object with localization utils and settings */
			i18n: {
				/** All languages */
				locales: string[];
				/** Current user locale */
				locale: string;
				/** Set locale to current user */
				setLocale: (lang: string, strict?: boolean) => void;
			};
			t: Bundle["formatPattern"];
		};
	}
> {
	const client = options && "t" in options ? options : getFluentClient(options);

	return new Plugin("@gramio/i18n").derive(() => {
		let language = client.languages.current;

		return {
			/** Object with localization utils and settings */
			i18n: {
				/** All languages */
				locales: client.languages.all,
				/** Current user locale */
				locale: language,
				/** Set locale to current user */
				setLocale: (lang: string, strict = false) => {
					if (!client.languages.all.includes(lang)) {
						if (strict) throw new Error(`No ${language} language found`);
						language = client.languages.fallback;
						return;
					}

					language = lang;
				},
			},
			t: ((id: string, args?: Record<string, FluentVariable>) => {
				const bundle = client.languages.bundles.get(language);

				if (!bundle) throw new Error(`No ${language} language found`);

				const message = bundle.getMessage(id);
				if (!message?.value) throw new Error(`No message found for ${id}`);

				return bundle.formatPattern(message.value, args);
			}) as Bundle["formatPattern"],
		};
	});
}
