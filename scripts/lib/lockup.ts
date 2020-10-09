import {Wallet, Contract} from 'ethers'
import * as ILockup from '../../build/IMigrateLockup.json'

export const createLockup = (wallet: Wallet) => (address: string): Contract =>
	new Contract(address, ILockup.abi, wallet)
