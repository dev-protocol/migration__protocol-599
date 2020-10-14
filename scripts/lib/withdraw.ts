import {Wallet, Contract, BigNumber, ethers} from 'ethers'
import {TransactionReceipt} from '@ethersproject/abstract-provider'
import * as IWithdraw from '../../build/IMigrateWithdraw.json'
import {send} from './send'

export const createWithdraw = (wallet: Wallet) => (address: string): Contract =>
	new Contract(address, IWithdraw.abi, wallet)

export const createInitLastWithdrawSender = (
	provider: ethers.providers.BaseProvider,
	contract: Contract,
	gasPriceFetcher: () => Promise<string | BigNumber>
): ((args: {
	property: string
	user: string
	cHoldersPrice: string
}) => Promise<TransactionReceipt | Error>) => {
	const sender = send(provider, contract, gasPriceFetcher)
	return async ({
		property,
		user,
		cHoldersPrice,
	}: {
		property: string
		user: string
		cHoldersPrice: string
	}): Promise<TransactionReceipt | Error> =>
		sender('__initLastWithdraw', [property, user, cHoldersPrice])
}
