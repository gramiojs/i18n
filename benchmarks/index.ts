import { bench, run, summary } from "mitata";

const count = 10;

const pluralRulesRU = new Intl.PluralRules("ru");

function plural(count: number) {
	const mod10 = count % 10;
	const mod100 = count % 100;

	if (mod10 === 1 && mod100 !== 11) return "one";
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "few";

	return "many";
}

summary(() => {
	bench("Intl.PluralRules", () => {
		return pluralRulesRU.select(count);
	});

	bench("Simple code", () => {
		return plural(count);
	});
});

await run();

// NODE

// clk: ~3.79 GHz
// cpu: AMD Ryzen 7 7700 8-Core Processor
// runtime: node 22.10.0 (x64-win32)

// benchmark                   avg (min … max) p75   p99    (min … top 1%)
// ------------------------------------------- -------------------------------
// Intl.PluralRules             200.95 ns/iter 195.87 ns ██
//                     (189.75 ns … 400.66 ns) 328.10 ns ██▂▂▁▁▁▁▂▁▁▁▁▁▁▁▁▁▁▁▁
// Simple code                  152.36 ps/iter 146.48 ps █
//                      (146.48 ps … 16.46 ns) 219.73 ps █▁▁▁▁▁▁▂▁▁▁▁▁▁▁▁▁▁▁▁▁

// summary
//   Simple code
//    1318.86x faster than Intl.PluralRules

// BUN

// clk: ~3.35 GHz
// cpu: AMD Ryzen 7 7700 8-Core Processor
// runtime: bun 1.1.38 (x64-win32)

// benchmark                   avg (min … max) p75   p99    (min … top 1%)
// ------------------------------------------- -------------------------------
// Intl.PluralRules             671.37 ns/iter 676.66 ns  █
//                     (636.38 ns … 908.54 ns) 844.43 ns ▅█▅▂▂▂▂▂▂▂▂▂▁▁▂▁▁▁▁▁▁
// Simple code                  246.34 ps/iter 244.14 ps    █
//                       (219.73 ps … 9.33 ns) 366.21 ps ▄▁▁█▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

// summary
//   Simple code
//    2725.4x faster than Intl.PluralRules

// DENO

// clk: ~4.98 GHz
// cpu: null
// runtime: deno 2.0.2 (x86_64-pc-windows-msvc)

// benchmark                   avg (min … max) p75   p99    (min … top 1%)
// ------------------------------------------- -------------------------------
// Intl.PluralRules             267.83 ns/iter 300.00 ns ▄      █
//                     (200.00 ns … 149.60 µs) 500.00 ns █▁▁▁▁▁▁█▁▁▁▁▁▂▁▁▁▁▁▁▁
// Simple code                  134.48 ps/iter 146.48 ps █
//                      (122.07 ps … 14.01 ns) 244.14 ps █▁▁▁▅▁▁▁▂▁▁▁▁▁▁▁▁▁▁▁▁

// summary
//   Simple code
//    1991.62x faster than Intl.PluralRules
