import Queue from 'p-queue'
import pRetry from 'p-retry'

type Task<TaskResultType> =
	| (() => PromiseLike<TaskResultType>)
	| (() => TaskResultType)

export const queueAll = (name: string, concurrency = 50, retries = 5) => async <
	T
>(
	tasks: Array<Task<T>>
): Promise<T[]> => {
	const que = new Queue({concurrency})
	que.on('next', () =>
		console.info(`${name}: Size: ${que.size}  Pending: ${que.pending}`)
	)

	return que.addAll(tasks.map((task) => async () => pRetry(task, {retries})))
}
