import {Wallet, Contract, BigNumber} from 'ethers'
import {TransactionResponse} from '@ethersproject/abstract-provider'
import * as IWithdraw from '../../build/IMigrateWithdraw.json'
import {GAS_LIMIT} from './constants'

export const createWithdraw = (wallet: Wallet) => (address: string): Contract =>
	new Contract(address, IWithdraw.abi, wallet)

export const createInitLastWithdrawSender = (
	contract: Contract,
	gasPriceFetcher: () => Promise<string | BigNumber>
) => async ({
	property,
	user,
	cHoldersPrice,
}: {
	property: string
	user: string
	cHoldersPrice: string
}): Promise<TransactionResponse> =>
	contract
		.__initLastWithdraw(property, user, cHoldersPrice, {
			gasLimit: GAS_LIMIT,
			gasPrice: await gasPriceFetcher(),
		})
		.catch(console.info)
