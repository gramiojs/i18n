import { describe, expect, it } from "bun:test";
import { Bot, InlineKeyboard, format } from "gramio";
import { defineI18n } from "../src";
import type {
	ExtractLanguages,
	LanguageMap,
	ShouldFollowLanguage,
} from "../src/types";

const en = {
	greeting: (name: string) => `Hello, ${name}!`,
	hi: {
		i: {
			really: {
				deep: {
					translation: "",
				},
			},
		},
	},
} satisfies LanguageMap;

const ru = {} satisfies ShouldFollowLanguage<typeof en>;

const i18n1 = defineI18n({
	languages: {
		en,
		ru,
	},
	primaryLanguage: "en",
});

type A = ExtractLanguages<typeof i18n1>["en"];

describe("I18n", () => {
	it("Just t", () => {
		const i18n = defineI18n({
			languages: {
				en: {
					// test: "",
					greeting: (name: string) => format`Hello, ${name}!`,
					// some: {
					// 	r: {
					// 		greeting: (name: string) => format`Привет, ${name}!`,
					// 	},
					// },
				},
				ru: {
					// test: "",
					greeting: (name: string) => format`Привет, ${name}!`,
					some: {
						r: {
							greeting: (name: string) => format`Привет, ${name}!`,
						},
					},
				},
			},
			primaryLanguage: "en",
		});

		i18n.t("ru", "some.r.greeting", "World");

		expect(i18n.t("en", "greeting", "World").toString()).toBe("Hello, World!");
		expect(i18n.t("ru", "greeting", "World").toString()).toBe("Привет, World!");
	});

	it("Just pickup primary translation", () => {
		const i18n = defineI18n({
			languages: {
				en,
				ru,
			},
			primaryLanguage: "en",
		});

		expect(i18n.t("en", "greeting", "World").toString()).toBe("Hello, World!");
		expect(i18n.t("ens", "greeting", "World").toString()).toBe("Hello, World!");
	});

	it("Just pickup primary translation", () => {
		const i18n = defineI18n({
			primaryLanguage: "en",
			languages: {
				en,
				ru,
			},
		});

		const bot = new Bot("s")
			.derive("message", (context) => {
				return {
					t: i18n.buildT(context.from?.languageCode),
				};
			})
			.on("message", (context) => {
				return context.send(context.t("hi.i.really.deep.translation"));
			});

		expect(i18n.t("en", "greeting", "World").toString()).toBe("Hello, World!");
		expect(i18n.t("en", "greeting", "World").toString()).toBe("Hello, World!");
	});

	it("localesFor returns non-primary language translations", () => {
		const i18n = defineI18n({
			primaryLanguage: "en",
			languages: {
				en: {
					cmd: {
						start: "Start the bot",
						help: "Show help",
					},
				},
				ru: {
					cmd: {
						start: "Запустить бота",
						help: "Помощь",
					},
				},
				de: {
					cmd: {
						start: "Bot starten",
						help: "Hilfe anzeigen",
					},
				},
			},
		});

		const locales = i18n.localesFor("cmd.start");
		expect(locales).toEqual({
			ru: "Запустить бота",
			de: "Bot starten",
		});
		expect(locales.en).toBeUndefined();
	});

	it("localesFor excludes primary language", () => {
		const i18n = defineI18n({
			primaryLanguage: "en",
			languages: {
				en: { greeting: "Hello" },
				ru: { greeting: "Привет" },
			},
		});

		const locales = i18n.localesFor("greeting");
		expect(Object.keys(locales)).toEqual(["ru"]);
		expect(locales.ru).toBe("Привет");
	});

	it("localesFor works with function translations (with args)", () => {
		const i18n = defineI18n({
			primaryLanguage: "en",
			languages: {
				en: {
					cmd: { greet: (name: string) => `Hello, ${name}` },
				},
				ru: {
					cmd: { greet: (name: string) => `Привет, ${name}` },
				},
			},
		});

		const locales = i18n.localesFor("cmd.greet", "World");
		expect(locales).toEqual({
			ru: "Привет, World",
		});
	});

	it("localesFor falls back to primary language value when key is missing", () => {
		const i18n = defineI18n({
			primaryLanguage: "en",
			languages: {
				en: {
					cmd: { start: "Start" },
				},
				ru: {} satisfies ShouldFollowLanguage<{ cmd: { start: string } }>,
			},
		});

		const locales = i18n.localesFor("cmd.start");
		// ru doesn't have its own value, falls back to "Start"
		expect(locales.ru).toBe("Start");
	});
});
