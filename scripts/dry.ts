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

;(async () => {
	const computedRecords = sortByBlockNumber(computed)
	const __initStakeOnProperty = shouldInitStakeOnProperty(computedRecords)
	const __initLastStakeOnProperty = shouldInitLastStakeOnProperty(
		computedRecords
	)
	const __initLastStake = shouldInitLastStake(computedRecords)
	const __initLastWithdraw = shouldinitLastWithdraw(computedRecords)

	const records = {
		__initStakeOnProperty,
		__initLastStakeOnProperty,
		__initLastStake,
		__initLastWithdraw,
	}

	await promisify(writeFile)(
		join(__dirname, '..', 'data', 'dry.json'),
		JSON.stringify(records)
	)
})().catch(console.error)
