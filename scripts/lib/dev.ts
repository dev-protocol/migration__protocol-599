import {Wallet, Contract, utils} from 'ethers'
import * as IDev from '../../build/IDev.json'

export const createDev = (wallet: Wallet) => (address: string): Contract =>
	new Contract(address, IDev.abi, wallet)

export const createDevInterface = (): utils.Interface =>
	new utils.Interface(IDev.abi)
