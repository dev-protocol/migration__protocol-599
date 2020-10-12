import {Contract} from 'ethers'
import {queue} from './queue'
import {
	createGetAllValue,
	createGetDifference,
	createGetPropertyValue,
} from './lockup'
import {LogWithProperty} from './transaction-filters'

const getCumulativeTotalRewards = async (
	contract: Contract,
	blockNumber: number
): Promise<string> => {
	const [value] = await createGetDifference(contract)()(blockNumber)
	return value.toString()
}

const getTotalStaked = async (
	contract: Contract,
	blockNumber: number
): Promise<string> => {
	const [value] = await createGetAllValue(contract)(blockNumber)
	return value.toString()
}

const getThePropertyStaked = async (
	contract: Contract,
	property: string,
	blockNumber: number
): Promise<string> => {
	const [value] = await createGetPropertyValue(contract)(property)(blockNumber)
	return value.toString()
}

export const addCumulativeTotalRewardsToLogs = (
	addressFecther: (block: number) => Promise<string>,
	lockupFactory: (address: string) => Contract
) => async <T extends LogWithProperty>(
	logs: T[]
): Promise<
	Array<
		T & {
			_cumulativeTotalRewards: string
			_totalStaked: string
			_thePropertyStaked: string
		}
	>
> =>
	queue('addCumulativeTotalRewardsToLogs').addAll(
		logs.map((log) => async () => {
			const {blockNumber} = log
			const address = await addressFecther(blockNumber)
			const lockup = lockupFactory(address)
			const property = log._property
			const [
				_cumulativeTotalRewards,
				_totalStaked,
				_totalStakedLast,
				_thePropertyStaked,
				_thePropertyStakedLast,
			] = await Promise.all([
				getCumulativeTotalRewards(lockup, blockNumber),
				getTotalStaked(lockup, blockNumber),
				getTotalStaked(lockup, blockNumber - 1),
				getThePropertyStaked(lockup, property, blockNumber),
				getThePropertyStaked(lockup, property, blockNumber - 1),
			])
			return {
				...log,
				...{
					_cumulativeTotalRewards,
					_totalStaked,
					_totalStakedLast,
					_thePropertyStaked,
					_thePropertyStakedLast,
				},
			}
		})
	)
