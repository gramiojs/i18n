import { describe, expect, it } from "bun:test";
import { format } from "gramio";
import { defineI18n } from "../src";
import type { ShouldFollowLanguage } from "../src/types";

const en = {
	greeting: (name: string) => format`Hello, ${name}!`,
};

const ru: ShouldFollowLanguage<typeof en> = {};

describe("I18n", () => {
	it("Just t", () => {
		const i18n = defineI18n({
			languages: {
				en: {
					greeting: (name: string) => format`Hello, ${name}!`,
				},
				ru: {
					greeting: (name: string) => format`Привет, ${name}!`,
				},
			},
			primaryLanguage: "en",
		});

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
		expect(i18n.t("rus" as string, "greeting", "World").toString()).toBe(
			"Hello, World!",
		);
	});
});
