export const add = <A>(data: A) => <T>(v: T): T & A => ({
	...v,
	...data,
})

export const sortByBlockNumber = <
	T extends Array<{[key: string]: any; blockNumber: number}>
>(
	data: T
): T => data.sort((a, b) => a.blockNumber - b.blockNumber)
