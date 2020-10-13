import {ethers} from 'ethers'
import {Log} from '@ethersproject/abstract-provider'
import {Except} from 'type-fest'
import {TransactionResponse} from '@ethersproject/abstract-provider'
import {queueAll} from './queue'

export const addTransactionToLogs = (
	provider: ethers.providers.BaseProvider
) => async <T extends Log>(
	logs: T[]
): Promise<
	Array<T & {_transaction: Except<TransactionResponse, 'confirmations'>}>
> =>
	queueAll('addTransactionToLogs')(
		logs.map((log) => async () =>
			provider
				.getTransaction(log.transactionHash)
				.then(({confirmations, ...x}) => ({...log, _transaction: x}))
		)
	)
