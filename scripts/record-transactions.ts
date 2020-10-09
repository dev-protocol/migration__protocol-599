/* eslint-disable @typescript-eslint/no-unused-vars */
import {createWallet} from './lib/client'
import {createDev} from './lib/dev'
import {config} from 'dotenv'
import {createLockup} from './lib/lockup'
import {createPropertyGroup} from './lib/property-group'
import {onlyStake, onlyUnstake} from './lib/transaction-filters'
import {add} from './lib/collection'
import {writeFile} from 'fs'
import {promisify} from 'util'
import {join} from 'path'
import {addTransactionToLogs} from './lib/transaction'
config()

const {
	INFURA: infura,
	MNEMONIC: mnemonic,
	DEV: devAddress = '0x5cAf454Ba92e6F2c929DF14667Ee360eD9fD5b26',
	LOCKUP: lockupAddress = '0x474956cf9fab3f5792d4ab86ad6d59db27748ec2',
	PROPERTY_GROUP: propertyGroupAddress = '0x7ba9c52453d2520e1484f99ae5b2e800cd781aa5',
	FROM_BLOCK: fromBlock = '10358615',
} = process.env

;(async () => {
	console.log(infura, mnemonic)
	if (!infura || !mnemonic) return

	const [wallet, provider] = createWallet(infura, mnemonic)
	const dev = createDev(wallet)(devAddress)
	const lockup = createLockup(wallet)(lockupAddress)
	const propertyGroup = createPropertyGroup(wallet)(propertyGroupAddress)

	const event = dev.filters.Transfer()
	const eventsTransfer = await provider.getLogs({
		...event,
		...{fromBlock: Number(fromBlock)},
	})

	const listStake = await onlyStake(eventsTransfer, propertyGroup)
	const listUnstake = await onlyUnstake(eventsTransfer, propertyGroup)
	const logs = [
		...listStake.map(add({_action: 'stake'})),
		...listUnstake.map(add({_action: 'unstake'})),
	]
	const records = await addTransactionToLogs(provider)(logs)
	const sorted = records.sort((a, b) => a.blockNumber - b.blockNumber)

	await promisify(writeFile)(
		join(__dirname, '..', 'data', 'staking.json'),
		JSON.stringify(sorted)
	)
})().catch(console.error)
