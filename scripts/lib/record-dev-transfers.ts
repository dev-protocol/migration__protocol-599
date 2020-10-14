import {Log} from '@ethersproject/abstract-provider'
import {createWallet} from './client'
import {createToken} from './token'
import {config} from 'dotenv'
import {arrayBetween} from './collection'
import {queueAll} from './queue'
config()

const {
	DEV: devAddress = '0x5cAf454Ba92e6F2c929DF14667Ee360eD9fD5b26',
	FROM_BLOCK: fromBlock = '10358615',
} = process.env

export const devTransfers = async (
	infura: string,
	mnemonic: string,
	_toBlock: string
): Promise<Log[]> => {
	const [wallet, provider] = createWallet(infura, mnemonic)
	const dev = createToken(wallet)(devAddress)

	const event = dev.filters.Transfer()
	const to = Number(_toBlock)
	const fromBlockNumber = Number(fromBlock)
	const blocksBase = arrayBetween(fromBlockNumber, to, 1000)
	const blocks = blocksBase.map((x, i) => ({
		...{
			fromBlock: x,
		},
		...((to) => (to ? {toBlock: to - 1} : {}))(blocksBase[i + 1]),
	}))
	const getLogsTasks = blocks.map(({fromBlock, toBlock}) => async () =>
		provider.getLogs({
			...event,
			...{
				fromBlock,
				toBlock,
			},
		})
	)

	const eventsTransfer = await queueAll('devTransfers')(getLogsTasks)

	return eventsTransfer.flat()
}
