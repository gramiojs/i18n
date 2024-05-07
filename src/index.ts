import fs from "node:fs";
import path from "node:path";
import {
	FluentBundle,
	FluentResource,
	type FluentVariable,
	// @ts-expect-error
} from "@fluent/bundle";
import { Plugin } from "gramio";

export interface I18nOptions {
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

export function i18n<Bundle extends FluentBundle = FluentBundle>(
	options?: I18nOptions,
) {
	const defaultLocale = options?.defaultLocale ?? "en";
	const directory = options?.directory ?? "locales";

	const bundles = new Map<string, FluentBundle>();

	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		if (!entry.isFile() || !entry.name.endsWith(".ftl")) continue;
		const lang = entry.name.slice(0, -4);

		const source = fs
			.readFileSync(path.resolve(directory, entry.name))
			.toString();

		const bundle = new FluentBundle(lang);
		const resource = new FluentResource(source);
		bundle.addResource(resource);
		bundles.set(lang, bundle);
	}

	return new Plugin("@gramio/i18n").derive((context) => {
		let language = defaultLocale;

		return {
			setLocale: (lang: string) => {
				if (!bundles.has(lang))
					throw new Error(`No ${language} language found`);

				language = lang;
			},
			t: ((
				id: string,
				args?: Record<string, FluentVariable>,
			) => {
				const bundle = bundles.get(language);
				if (!bundle) throw new Error(`No ${language} language found`);

				const message = bundle.getMessage(id);
				if (!message?.value) throw new Error(`No message found for ${id}`);

				return bundle.formatPattern(message.value, args);
			}) as Bundle["formatPattern"],
		};
	});
}
