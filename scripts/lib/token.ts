import {Wallet, Contract} from 'ethers'
import * as IDev from '../../build/IDev.json'

export const createToken = (wallet: Wallet) => (address: string): Contract =>
	new Contract(address, IDev.abi, wallet)
