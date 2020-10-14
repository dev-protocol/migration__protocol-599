import {Contract, BigNumber, ethers} from 'ethers'
import {
	TransactionReceipt,
	TransactionResponse,
} from '@ethersproject/abstract-provider'
import {GAS_LIMIT} from './constants'

export const send = (
	provider: ethers.providers.BaseProvider,
	contract: Contract,
	gasPriceFetcher: () => Promise<string | BigNumber>
) => async <T>(
	method: string,
	args: T[]
): Promise<TransactionReceipt | Error> => {
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

	const tx: TransactionResponse = await fn(...args, {
		gasLimit: GAS_LIMIT,
		gasPrice: await gasPriceFetcher(),
	})
	return provider.waitForTransaction(tx.hash)
}
