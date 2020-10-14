import {Wallet, Contract, BigNumber} from 'ethers'
import {TransactionResponse} from '@ethersproject/abstract-provider'
import * as IWithdraw from '../../build/IMigrateWithdraw.json'
import {send} from './send'

export const createWithdraw = (wallet: Wallet) => (address: string): Contract =>
	new Contract(address, IWithdraw.abi, wallet)

export const createInitLastWithdrawSender = (
	contract: Contract,
	gasPriceFetcher: () => Promise<string | BigNumber>
): ((args: {
	property: string
	user: string
	cHoldersPrice: string
}) => Promise<TransactionResponse | Error>) => {
	const sender = send(contract, gasPriceFetcher)
	return async ({
		property,
		user,
		cHoldersPrice,
	}: {
		property: string
		user: string
		cHoldersPrice: string
	}): Promise<TransactionResponse | Error> =>
		sender('__initLastWithdraw', [property, user, cHoldersPrice])
}
