import {Wallet, Contract, BigNumber} from 'ethers'
import * as ILockup from '../../build/IMigrateLockup.json'

export const createLockup = (wallet: Wallet) => (address: string): Contract =>
	new Contract(address, ILockup.abi, wallet)

export const createGetDifference = (contract: Contract) => (
	property = '0x05BC991269a9730232a65ea7C471ABcC7D86A5B3',
	last = 0
) => async (
	blockNumber: number
): Promise<
	[
		reward: BigNumber,
		holdersAmount: BigNumber,
		holdersPrice: BigNumber,
		interestAmount: BigNumber,
		interestPrice: BigNumber
	]
> =>
	contract.functions.difference(property, String(last), {blockTag: blockNumber})

export const createGetAllValue = (contract: Contract) => async (
	blockNumber: number
): Promise<[vale: BigNumber]> =>
	contract.functions.getAllValue({blockTag: blockNumber})

export const createGetPropertyValue = (contract: Contract) => (
	property: string
) => async (blockNumber: number): Promise<[vale: BigNumber]> =>
	contract.functions.getPropertyValue(property, {blockTag: blockNumber})
