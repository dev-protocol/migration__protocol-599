import {writeFile} from 'fs'
import {promisify} from 'util'
import {join} from 'path'
import computed from '../data/computed.json'
import {sortByBlockNumber} from './lib/collection'
import {IterableElement} from 'type-fest'

const findLastTransactions = (
	data: typeof computed,
	createKey: (el: IterableElement<typeof data>) => string
) => {
	const last: Map<string, IterableElement<typeof data>> = new Map()
	for (const iterator of data) {
		const key = createKey(iterator)
		const blockNumber = iterator.blockNumber
		const got = last.get(key)
		if (got && blockNumber < got.blockNumber) {
			break
		}

		last.set(key, iterator)
	}

	return Array.from(last.values())
}

const shouldInitStakeOnProperty = (data: typeof computed) =>
	findLastTransactions(data, (x) => `${x.hookedProperty}${x.hookedUser}`)

const shouldInitLastStakeOnProperty = (data: typeof computed) =>
	findLastTransactions(data, (x) => x.hookedProperty)

;(async () => {
	const computedRecords = sortByBlockNumber(computed)
	const __initStakeOnProperty = shouldInitStakeOnProperty(computedRecords)
	const __initLastStakeOnProperty = shouldInitLastStakeOnProperty(
		computedRecords
	)
	const __initLastStake = computedRecords[computedRecords.length - 1]
	const records = {
		__initStakeOnProperty,
		__initLastStakeOnProperty,
		__initLastStake,
	}

	await promisify(writeFile)(
		join(__dirname, '..', 'data', 'dry.json'),
		JSON.stringify(records)
	)
})().catch(console.error)
