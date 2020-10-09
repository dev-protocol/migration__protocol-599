import {Contract} from 'ethers'
import {Log} from '@ethersproject/abstract-provider'
import {queue} from './queue'

const hexToAddress = (hex: string): string | undefined =>
	((x) => (x ? `${x[1]}${x[2]}` : undefined))(/^(0x).{24}(.{40})/.exec(hex))

const getSenderAddress = (topics: string[]): string | undefined =>
	hexToAddress(topics[1])

const getRecipientAddress = (topics: string[]): string | undefined =>
	hexToAddress(topics[2])

const isProperty = (
	address: (topics: string[]) => string | undefined,
	propertyGroup: Contract
) => ({transactionHash, topics}: Log) => async () => {
	const yes = await propertyGroup.functions
		.isGroup(address(topics))
		.then(([y]: [boolean]) => y)
	return {
		transactionHash,
		yes,
	}
}

const onlyProperty = (filterFn: ReturnType<typeof isProperty>) => async (
	logs: readonly Log[]
): Promise<readonly Log[]> => {
	const res = await queue('onlyProperty').addAll(logs.map(filterFn))
	return logs.filter(
		(log) => res.find((x) => x.transactionHash === log.transactionHash)?.yes
	)
}

export const onlyStake = async (
	logs: readonly Log[],
	propertyGroup: Contract
): Promise<readonly Log[]> =>
	onlyProperty(isProperty(getRecipientAddress, propertyGroup))(logs)

export const onlyUnstake = async (
	logs: readonly Log[],
	propertyGroup: Contract
): Promise<readonly Log[]> =>
	onlyProperty(isProperty(getSenderAddress, propertyGroup))(logs)
