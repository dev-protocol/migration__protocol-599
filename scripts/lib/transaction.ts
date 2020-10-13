import {ethers} from 'ethers'
import {Log} from '@ethersproject/abstract-provider'
import {Except} from 'type-fest'
import {TransactionResponse} from '@ethersproject/abstract-provider'
import {queue} from './queue'
import pRetry from 'p-retry'

export const addTransactionToLogs = (
	provider: ethers.providers.BaseProvider
) => async <T extends Log>(
	logs: T[]
): Promise<
	Array<T & {_transaction: Except<TransactionResponse, 'confirmations'>}>
> =>
	queue('addTransactionToLogs').addAll(
		logs.map((log) => async () =>
			pRetry(
				async () =>
					provider
						.getTransaction(log.transactionHash)
						.then(({confirmations, ...x}) => ({...log, _transaction: x})),
				{retries: 5}
			)
		)
	)
