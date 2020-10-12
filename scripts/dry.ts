import {writeFile} from 'fs'
import {promisify} from 'util'
import {join} from 'path'
import computed from '../data/computed.json'
import {sortByBlockNumber} from './lib/collection'
import {IterableElement} from 'type-fest'

const findLastTransactions = (
	data: typeof computed,
	createKey: (el: IterableElement<typeof data>) => string,
	targetAction: string[]
) => {
	const last: Map<string, IterableElement<typeof data>> = new Map()
	for (const iterator of data) {
		const {action, blockNumber} = iterator
		if (!targetAction.includes(action)) {
			continue
		}

		const key = createKey(iterator)
		const got = last.get(key)
		if (got && blockNumber < got.blockNumber) {
			continue
		}

		last.set(key, iterator)
	}

	return Array.from(last.values())
}

const shouldInitStakeOnProperty = (data: typeof computed) =>
	findLastTransactions(
		data,
		(x) => `stake-or-unstake-${x.hookedProperty}${x.hookedUser}`,
		['stake', 'unstake']
	)

const shouldInitLastStakeOnProperty = (data: typeof computed) =>
	findLastTransactions(data, (x) => x.hookedProperty, ['stake', 'unstake'])

const shouldInitLastStake = (data: typeof computed) =>
	findLastTransactions(data, () => 'stake-or-unstake', ['stake', 'unstake'])

const shouldinitLastWithdraw = (data: typeof computed) =>
	findLastTransactions(
		data,
		(x) => `withdraw-${x.hookedProperty}${x.hookedUser}`,
		['withdraw']
	)

export const dry = (
	records: typeof computed
): {
	__initStakeOnProperty: typeof computed
	__initLastStakeOnProperty: typeof computed
	__initLastStake: typeof computed
	__initLastWithdraw: typeof computed
} =>
	((sortedRecords) =>
		(([
			__initStakeOnProperty,
			__initLastStakeOnProperty,
			__initLastStake,
			__initLastWithdraw,
		]) => ({
			__initStakeOnProperty,
			__initLastStakeOnProperty,
			__initLastStake,
			__initLastWithdraw,
		}))([
			shouldInitStakeOnProperty(sortedRecords),
			shouldInitLastStakeOnProperty(sortedRecords),
			shouldInitLastStake(sortedRecords),
			shouldinitLastWithdraw(sortedRecords),
		]))(sortByBlockNumber(records))
;(async () => {
	await promisify(writeFile)(
		join(__dirname, '..', 'data', 'dry.json'),
		JSON.stringify(dry(computed))
	)
})().catch(console.error)
