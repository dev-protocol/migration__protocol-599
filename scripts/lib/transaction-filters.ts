import Queue from 'p-queue'
import {Contract} from 'ethers'
import {Log} from '@ethersproject/abstract-provider'
import {ZERO_ADDRESS} from './constants'

const hexToAddress = (hex: string): string | undefined =>
	((x) => (x ? `${x[1]}${x[2]}` : undefined))(/^(0x).{24}(.{40})/.exec(hex))
const getSenderAddress = (topics: string[]): string | undefined =>
	hexToAddress(topics[1])

const getRecipientAddress = (topics: string[]): string | undefined =>
	hexToAddress(topics[2])

const filterSendFromAccount = (log: Log) =>
	getSenderAddress(log.topics) !== ZERO_ADDRESS

const createFetcher = (
	address: (topics: string[]) => string | undefined,
	propertyGroup: Contract
) => ({transactionHash, topics}: Log) => async () => {
	const target = address(topics)
	const yes = await propertyGroup.functions
		.isGroup(target)
		.then((x: [boolean]) => x[0])
	return {
		transactionHash,
		yes,
	}
}

export const onlyDeposit = async (
	logs: readonly Log[],
	propertyGroup: Contract
): Promise<readonly Log[]> => {
	const fetcher = createFetcher(getRecipientAddress, propertyGroup)
	const res = await new Queue().addAll(
		logs.filter(filterSendFromAccount).map(fetcher)
	)
	console.log(res)
	return logs.filter(
		(log) => res.find((x) => x.transactionHash === log.transactionHash)?.yes
	)
}

export const onlyDepositRelease = async (
	logs: readonly Log[],
	propertyGroup: Contract
): Promise<readonly Log[]> => {
	const fetcher = createFetcher(getSenderAddress, propertyGroup)
	const res = await new Queue().addAll(
		logs.filter(filterSendFromAccount).map(fetcher)
	)
	return logs.filter(
		(log) => res.find((x) => x.transactionHash === log.transactionHash)?.yes
	)
}
