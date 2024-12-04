export function pluralizeRussian<T>(count: number, one: T, few: T, many: T): T {
	const mod10 = count % 10;
	const mod100 = count % 100;

	if (mod10 === 1 && mod100 !== 11) return one;
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;

	return many;
}
