export const add = <A>(data: A) => <T>(v: T): T & A => ({
	...v,
	...data,
})
