import Queue from 'p-queue'

export const queue = (name: string, concurrency = 50): Queue => {
	const que = new Queue({concurrency})
	return que.on('next', () =>
		console.info(`${name}: Size: ${que.size}  Pending: ${que.pending}`)
	)
}
