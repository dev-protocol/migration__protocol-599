import {Contract} from 'ethers'
import {Log} from '@ethersproject/abstract-provider'
import {queue} from './queue'
import {IterableElement, PromiseValue} from 'type-fest'
import {addTransactionToLogs} from './transaction'
import {WITHDRAW} from './constants'

export type IsPropertyResponse = {
	_property?: string
	transactionHash: string
	yes: boolean
}
export type OnlyPropertyResponse = IsPropertyResponse & {
	_property: string
}
export type LogWithTransaction = IterableElement<
	PromiseValue<ReturnType<ReturnType<typeof addTransactionToLogs>>>
>
export type LogWithProperty<T = Log> = T &
	Log & {
		_property: string
	}

const hexToAddress = (hex: string): string | undefined =>
	((x) => (x ? `${x[1]}${x[2]}` : undefined))(/^(0x).{24}(.{40})/.exec(hex))

const getSenderAddress = (topics: string[]): string | undefined =>
	hexToAddress(topics[1])

const getRecipientAddress = (topics: string[]): string | undefined =>
	hexToAddress(topics[2])

const isProperty = (
	address: (topics: string[]) => string | undefined,
	propertyGroup: Contract
) => <T extends Log>({transactionHash, topics}: T) => async (): Promise<
	IsPropertyResponse
> => {
	const property = address(topics)
	const yes = await propertyGroup.functions
		.isGroup(property)
		.then(([y]: [boolean]) => y)
	return {
		_property: property,
		transactionHash,
		yes,
	}
}

const onlyProperty = (filterFn: ReturnType<typeof isProperty>) => async <
	T extends Log
>(
	logs: readonly T[]
): Promise<ReadonlyArray<LogWithProperty<T>>> => {
	const find = (a: IsPropertyResponse[], b: Log) =>
		a.find((x) => x.transactionHash === b.transactionHash)
	const res = await queue('onlyProperty').addAll(logs.map(filterFn))
	return logs
		.filter((log) => find(res, log)?.yes)
		.map((log) => ({
			...log,
			...{
				_property: (find(res, log) as OnlyPropertyResponse)._property,
			},
		}))
}

export const onlyStake = async <T extends Log>(
	logs: readonly T[],
	propertyGroup: Contract
): Promise<ReadonlyArray<LogWithProperty<T>>> =>
	onlyProperty(isProperty(getRecipientAddress, propertyGroup))(logs)

export const onlyUnstake = async <T extends Log>(
	logs: readonly T[],
	propertyGroup: Contract
): Promise<ReadonlyArray<LogWithProperty<T>>> =>
	onlyProperty(isProperty(getSenderAddress, propertyGroup))(logs)

export const onlyPropertyWithdraw = async <T extends LogWithTransaction>(
	logs: readonly T[]
): Promise<ReadonlyArray<LogWithProperty<T>>> =>
	onlyProperty((el) => async (): Promise<IsPropertyResponse> => {
		const {
			transactionHash,
			_transaction,
		} = (el as unknown) as LogWithTransaction
		const {data} = _transaction
		const yes = data.startsWith(WITHDRAW)
		const property = `0x${data.slice(-40)}`
		return {
			_property: property,
			transactionHash,
			yes,
		}
	})(logs)
