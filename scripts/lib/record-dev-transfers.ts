import {Log} from '@ethersproject/abstract-provider'
import {createWallet} from './client'
import {createToken} from './token'
import {config} from 'dotenv'
config()

const {
	DEV: devAddress = '0x5cAf454Ba92e6F2c929DF14667Ee360eD9fD5b26',
	FROM_BLOCK: fromBlock = '10358615',
} = process.env

export const devTransfers = async (
	infura: string,
	mnemonic: string
): Promise<Log[]> => {
	const [wallet, provider] = createWallet(infura, mnemonic)
	const dev = createToken(wallet)(devAddress)

	const event = dev.filters.Transfer()
	const eventsTransfer = await provider.getLogs({
		...event,
		...{fromBlock: Number(fromBlock)},
	})

	return eventsTransfer
}
