import { describe, expect, it } from "bun:test";
import { defineI18n, pluralizeEnglish, pluralizeRussian } from "../src";

describe("Plurals", () => {
	it("pluralizeEnglish and pluralizeRussian", () => {
		const i18n = defineI18n({
			languages: {
				en: {
					test: (n: number) => pluralizeEnglish(n, "one", "other"),
				},
				ru: {
					test: (n: number) =>
						pluralizeRussian(n, "один", "несколько", "много"),
				},
			},
			primaryLanguage: "en",
		});

		// en
		expect(i18n.t("en", "test", 1)).toBe("one");
		expect(i18n.t("en", "test", 2)).toBe("other");
		expect(i18n.t("en", "test", 0)).toBe("other");
		expect(i18n.t("en", "test", 10)).toBe("other");
		expect(i18n.t("en", "test", 11)).toBe("other");
		expect(i18n.t("en", "test", 21)).toBe("other");

		// ru
		expect(i18n.t("ru", "test", 1)).toBe("один");
		expect(i18n.t("ru", "test", 2)).toBe("несколько");
		expect(i18n.t("ru", "test", 3)).toBe("несколько");
		expect(i18n.t("ru", "test", 4)).toBe("несколько");
		expect(i18n.t("ru", "test", 5)).toBe("много");
		expect(i18n.t("ru", "test", 10)).toBe("много");
		expect(i18n.t("ru", "test", 11)).toBe("много");
		expect(i18n.t("ru", "test", 21)).toBe("один");
		expect(i18n.t("ru", "test", 22)).toBe("несколько");
		expect(i18n.t("ru", "test", 25)).toBe("много");
	});
});
