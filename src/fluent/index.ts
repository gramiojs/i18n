/**
 * @module
 * `i18n` fluent plugin for [GramIO](https://gramio.dev/).
 */
import fs from "node:fs";
import path from "node:path";
import {
	FluentBundle,
	FluentResource,
	type FluentVariable,
	// @ts-ignore
} from "@fluent/bundle";
import { Plugin } from "gramio";

/** Options for {@link i18n} plugin */
export interface I18nFluentOptions {
	/**
	 * Default locale
	 * @default "en"
	 */
	defaultLocale?: string;
	/**
	 * The path to the folder with `*.ftl` files
	 * @default "locales"
	 */
	directory?: string;
}

/**
 * This plugin provide internationalization for your bots with [Fluent](https://projectfluent.org/) syntax.
 * @example
 * ```ts
 * import { Bot } from "gramio";
 * import { i18n } from "@gramio/i18n";
 *
 * const bot = new Bot(process.env.TOKEN as string)
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
	options?: I18nFluentOptions,
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
	const directory = options?.directory ?? "locales";

	const bundles = new Map<string, FluentBundle>();

	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		if (!entry.isFile() || !entry.name.endsWith(".ftl")) continue;
		const lang = entry.name.slice(0, -4);

		const source = fs
			.readFileSync(path.resolve(directory, entry.name))
			.toString();

		// TODO: add Formattable support
		const bundle = new FluentBundle(lang, {
			// functions: {
			// 	TEST: (value) => {
			// 		console.log("E", value);
			// 		return value[0];
			// 	}
			// },
			// transform: (text) => {
			// 	console.log("T", text)
			// 	return {toJSON: () => {
			// 		console.log("called toJSON")
			// 		return text;
			// 	}};
			// }
		});
		const resource = new FluentResource(source);
		bundle.addResource(resource);
		bundles.set(lang, bundle);
	}
	const defaultLocale = options?.defaultLocale ?? bundles.keys().next().value;

	if (!defaultLocale)
		throw new Error("Please specify one or more translations");

	return new Plugin("@gramio/i18n").derive(() => {
		let language = defaultLocale;

		return {
			/** Object with localization utils and settings */
			i18n: {
				/** All languages */
				locales: Array.from(bundles.keys()),
				/** Current user locale */
				locale: language,
				/** Set locale to current user */
				setLocale: (lang: string, strict = false) => {
					if (!bundles.has(lang)) {
						console.log(language, defaultLocale, strict, bundles);
						if (strict) throw new Error(`No ${language} language found`);
						language = defaultLocale;
						return;
					}

					language = lang;
				},
			},
			t: ((id: string, args?: Record<string, FluentVariable>) => {
				const bundle = bundles.get(language);

				if (!bundle) throw new Error(`No ${language} language found`);

				const message = bundle.getMessage(id);
				if (!message?.value) throw new Error(`No message found for ${id}`);

				return bundle.formatPattern(message.value, args);
			}) as Bundle["formatPattern"],
		};
	});
}
