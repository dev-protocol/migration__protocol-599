export const add = <A>(data: A) => <T>(v: T): T & A => ({
	...v,
	...data,
})

export const sortByBlockNumber = <
	T extends Array<{[key: string]: any; blockNumber: number}>
>(
	data: T
): T => data.sort((a, b) => a.blockNumber - b.blockNumber)

export const arrayBetween = (
	begin: number,
	end: number,
	gap: number
): number[] => {
	const fn = (prevNum: number, prevArray: number[]): number[] => {
		const nextNum = prevNum + gap < end ? prevNum + gap : end
		const nextArray = [...prevArray, ...[nextNum]]
		return nextNum === end ? nextArray : fn(nextNum, nextArray)
	}

	return fn(begin, [])
}
