export function pluralizeEnglish<T>(n: number, one: T, many: T): T {
	return n === 1 ? one : many;
}
