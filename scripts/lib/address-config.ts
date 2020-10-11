import {Wallet, Contract} from 'ethers'
import * as IAddressConfig from '../../build/IAddressConfig.json'

export const createAddressConfig = (wallet: Wallet) => (
	address: string
): Contract => new Contract(address, IAddressConfig.abi, wallet)

export const createGetLockup = (contract: Contract) => async (
	blockNumber: number
): Promise<string> =>
	contract.functions.lockup({blockTag: blockNumber}).then(([x]: [string]) => x)
