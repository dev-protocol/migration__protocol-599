import {Contract, BigNumber} from 'ethers'
import {TransactionResponse} from '@ethersproject/abstract-provider'
import {GAS_LIMIT} from './constants'

export const send = (
	contract: Contract,
	gasPriceFetcher: () => Promise<string | BigNumber>
) => async <T>(
	method: string,
	args: T[]
): Promise<TransactionResponse | Error> => {
	const fn = contract[method]
	const gasLimit = await contract.estimateGas[method](...args, {
		gasLimit: GAS_LIMIT,
	})
		.then((x: BigNumber) => x)
		.catch((err: Error) => (err instanceof Error ? err : new Error(err)))
	if (gasLimit instanceof Error) {
		console.log('An error is expected', gasLimit.message, method, args)
		return gasLimit
	}

	return fn(...args, {
		gasLimit,
		gasPrice: await gasPriceFetcher(),
	})
}
