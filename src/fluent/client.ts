import fs from "node:fs";
import path from "node:path";
import {
	FluentBundle,
	FluentResource,
	type FluentVariable,
	// @ts-ignore
} from "@fluent/bundle";

/**
 * Options for {@link getFluentClient}
 */
export interface I18nFluentClientOptions {
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
 * Fluent client
 */
export interface I18nFluentClient<
	Bundle extends FluentBundle = FluentBundle,
	Languages extends string = string,
> {
	languages: {
		/**
		 * Bundles
		 */
		bundles: Map<string, Bundle>;
		/**
		 * Default locale
		 * @default "en"
		 */
		fallback: Languages;
		/**
		 * All locales
		 */
		all: Languages[];
		/**
		 * Current locale
		 */
		current: Languages;
		/**
		 * Change the current locale
		 */
		change: (language: Languages) => void;
	};
	/**
	 * Format pattern
	 */
	t: Bundle["formatPattern"];
}

/**
 * Get fluent client
 */
export function getFluentClient<
	Bundle extends FluentBundle = FluentBundle,
	Languages extends string = string,
>(options?: I18nFluentClientOptions): I18nFluentClient<Bundle, Languages> {
	const directory = options?.directory ?? "locales";

	const bundles = new Map<string, FluentBundle>();

	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		if (!entry.isFile() || !entry.name.endsWith(".ftl")) continue;
		const lang = entry.name.slice(0, -4);

		const source = fs
			.readFileSync(path.resolve(directory, entry.name))
			.toString();

		// TODO: add Formattable support
		const bundle = new FluentBundle(lang);
		const resource = new FluentResource(source);
		bundle.addResource(resource);
		bundles.set(lang, bundle);
	}

	const defaultLocale = (options?.defaultLocale ??
		bundles.keys().next().value) as Languages;

	if (!defaultLocale)
		throw new Error("Please specify one or more translations");

	let currentLanguage = defaultLocale;

	return {
		languages: {
			bundles,
			fallback: defaultLocale,
			all: Array.from(bundles.keys()) as Languages[],
			current: currentLanguage,
			change: (language: Languages) => {
				if (!bundles.has(language))
					throw new Error(`No ${language} language found`);

				currentLanguage = language;
			},
		},
		t: ((id: string, args?: Record<string, FluentVariable>) => {
			const bundle = bundles.get(currentLanguage);

			if (!bundle) throw new Error(`No ${currentLanguage} language found`);

			const message = bundle.getMessage(id);
			if (!message?.value) throw new Error(`No message found for ${id}`);

			return bundle.formatPattern(message.value, args);
		}) as Bundle["formatPattern"],
	};
}

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
