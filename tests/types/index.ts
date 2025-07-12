import { expectTypeOf } from "expect-type";
import { format } from "gramio";
import {
	type GetI18nKeys,
	type GetI18nParams,
	defineI18n,
} from "../../src/index.js";

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

export type A = GetI18nParams<typeof i18n, "greeting">;

expectTypeOf<A>().toEqualTypeOf<[name: string]>();

export type B = GetI18nKeys<typeof i18n>;

expectTypeOf<B>().toEqualTypeOf<"greeting">();
