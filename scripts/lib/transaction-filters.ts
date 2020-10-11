import {Contract} from 'ethers'
import {Log} from '@ethersproject/abstract-provider'
import {queue} from './queue'

export type IsPropertyResponse = {
	_property?: string
	transactionHash: string
	yes: boolean
}
export type OnlyPropertyResponse = IsPropertyResponse & {
	_property: string
}
export type LogWithProperty = Log & {
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
) => ({transactionHash, topics}: Log) => async (): Promise<
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

const onlyProperty = (filterFn: ReturnType<typeof isProperty>) => async (
	logs: readonly Log[]
): Promise<readonly LogWithProperty[]> => {
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

export const onlyStake = async (
	logs: readonly Log[],
	propertyGroup: Contract
): Promise<readonly LogWithProperty[]> =>
	onlyProperty(isProperty(getRecipientAddress, propertyGroup))(logs)

export const onlyUnstake = async (
	logs: readonly Log[],
	propertyGroup: Contract
): Promise<readonly LogWithProperty[]> =>
	onlyProperty(isProperty(getSenderAddress, propertyGroup))(logs)
