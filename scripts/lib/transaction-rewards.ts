import {Contract} from 'ethers'
import {Log} from '@ethersproject/abstract-provider'
import {queue} from './queue'
import {createGetDifference} from './lockup'

export const addCumulativeTotalRewardsToLogs = (
	addressFecther: (block: number) => Promise<string>,
	lockupFactory: (address: string) => Contract
) => async (
	logs: Log[]
): Promise<Array<Log & {_cumulativeTotalRewards: string}>> =>
	queue('addCumulativeTotalRewardsToLogs').addAll(
		logs.map((log) => async () => {
			const {blockNumber} = log
			const address = await addressFecther(blockNumber)
			const lockup = lockupFactory(address)
			const [reward] = await createGetDifference(lockup)()(blockNumber)
			const _cumulativeTotalRewards = reward.toString()
			return {...log, ...{_cumulativeTotalRewards}}
		})
	)
