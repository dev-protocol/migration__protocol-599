import {ethers} from 'ethers'
import {Log} from '@ethersproject/abstract-provider'
import {TransactionResponse} from '@ethersproject/abstract-provider'
import {queue} from './queue'

export const addTransactionToLogs = (
	provider: ethers.providers.BaseProvider
) => async (
	logs: Log[]
): Promise<Array<Log & {_transaction: TransactionResponse}>> =>
	queue('addTransactionToLogs').addAll(
		logs.map((log) => async () =>
			provider
				.getTransaction(log.transactionHash)
				.then((_transaction) => ({...log, _transaction}))
		)
	)
