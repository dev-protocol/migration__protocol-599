export const txError = (...args: any[]) => (err: Error): void => {
	console.error(err.message, args)
}
