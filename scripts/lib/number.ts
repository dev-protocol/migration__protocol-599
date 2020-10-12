import {BigNumber} from 'ethers'

export const toBigNumber = (v: string | number): BigNumber => BigNumber.from(v)
