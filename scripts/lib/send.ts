import {Contract, BigNumber} from 'ethers'
import {
	TransactionReceipt,
	TransactionResponse,
} from '@ethersproject/abstract-provider'
import {EXPECTED_ERROR_MESSAGE, GAS_LIMIT} from './constants'

const ERROR =
	'cannot estimate gas; transaction may fail or may require manual gas limit'

export const send = (
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
		const err = gasLimit
		const isExpectedError = err.message.includes(ERROR)
		console.log(
			`An error is expected: `,
			isExpectedError ? ERROR : err.message,
			method,
			args
		)
		return isExpectedError ? new Error(EXPECTED_ERROR_MESSAGE) : err
	}

	return fn(...args, {
		gasLimit,
		gasPrice: await gasPriceFetcher(),
	}).then(async (x: TransactionResponse) => x.wait())
}
