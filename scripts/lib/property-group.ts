import {Wallet, Contract} from 'ethers'
import * as IPropertyGroup from '../../build/IPropertyGroup.json'

export const createPropertyGroup = (wallet: Wallet) => (
	address: string
): Contract => new Contract(address, IPropertyGroup.abi, wallet)
