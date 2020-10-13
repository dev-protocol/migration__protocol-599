import {Wallet, Contract, BigNumber} from 'ethers'
import {TransactionResponse} from '@ethersproject/abstract-provider'
import * as ILockup from '../../build/IMigrateLockup.json'
import {GAS_LIMIT} from './constants'

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

export const createInitStakeOnPropertySender = (
	contract: Contract,
	gasPriceFetcher: () => Promise<string | BigNumber>
) => async ({
	property,
	user,
	cInterestPrice,
}: {
	property: string
	user: string
	cInterestPrice: string
}): Promise<TransactionResponse> =>
	contract
		.__initStakeOnProperty(property, user, cInterestPrice, {
			gasLimit: GAS_LIMIT,
			gasPrice: await gasPriceFetcher(),
		})
		.catch(console.info)

export const createInitLastStakeOnPropertySender = (
	contract: Contract,
	gasPriceFetcher: () => Promise<string | BigNumber>
) => async ({
	property,
	cHoldersAmountPerProperty,
	cHoldersPrice,
}: {
	property: string
	cHoldersAmountPerProperty: string
	cHoldersPrice: string
}): Promise<TransactionResponse> =>
	contract
		.__initLastStakeOnProperty(
			property,
			cHoldersAmountPerProperty,
			cHoldersPrice,
			{
				gasLimit: GAS_LIMIT,
				gasPrice: await gasPriceFetcher(),
			}
		)
		.catch(console.info)

export const createInitLastStakeSender = (
	contract: Contract,
	gasPriceFetcher: () => Promise<string | BigNumber>
) => async ({
	cReward,
	cInterestPrice,
	cHoldersPrice,
}: {
	cReward: string
	cInterestPrice: string
	cHoldersPrice: string
}): Promise<TransactionResponse> =>
	contract
		.__initLastStake(cReward, cInterestPrice, cHoldersPrice, {
			gasLimit: GAS_LIMIT,
			gasPrice: await gasPriceFetcher(),
		})
		.catch(console.info)
