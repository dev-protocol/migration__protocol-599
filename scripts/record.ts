import {createWallet} from './lib/client'
import {config} from 'dotenv'
import {createLockup} from './lib/lockup'
import {createPropertyGroup} from './lib/property-group'
import {
	onlyPropertyWithdraw,
	onlyStake,
	onlyUnstake,
} from './lib/transaction-filters'
import {add, sortByBlockNumber} from './lib/collection'
import {writeFile} from 'fs'
import {promisify} from 'util'
import {join} from 'path'
import {addTransactionToLogs} from './lib/transaction'
import {addCumulativeTotalRewardsToLogs} from './lib/transaction-rewards'
import {createAddressConfig, createGetLockup} from './lib/address-config'
import {devTransfers} from './lib/record-dev-transfers'
import {propertyTransfers} from './lib/record-property-transfers'
config()

const {
	INFURA: infura,
	MNEMONIC: mnemonic,
	CONFIG: configAddress = '0x1d415aa39d647834786eb9b5a333a50e9935b796',
	PROPERTY_GROUP: propertyGroupAddress = '0x7ba9c52453d2520e1484f99ae5b2e800cd781aa5',
} = process.env

;(async () => {
	if (!infura || !mnemonic) return

	const [wallet, provider] = createWallet(infura, mnemonic)
	const address = createAddressConfig(wallet)(configAddress)
	const lockupFactory = createLockup(wallet)
	const propertyGroup = createPropertyGroup(wallet)(propertyGroupAddress)
	const addTransaction = addTransactionToLogs(provider)
	const addCumulativeTotalRewards = addCumulativeTotalRewardsToLogs(
		createGetLockup(address),
		lockupFactory
	)

	const devTransferLogs = await devTransfers(infura, mnemonic)
	const propertyTransferLogs = await propertyTransfers(infura, mnemonic)
	console.log(
		'devTransferLogs',
		devTransferLogs.length,
		'propertyTransferLogs',
		propertyTransferLogs.length
	)
	if (propertyTransferLogs.length > 0) {
		throw new Error('Not implemented yet')
	}

	const allLogs = [...devTransferLogs, ...propertyTransferLogs]

	const logWithTx = await addTransaction(allLogs)
	const listStake = await onlyStake(logWithTx, propertyGroup)
	const listUnstake = await onlyUnstake(logWithTx, propertyGroup)
	const listWithdraw = await onlyPropertyWithdraw(logWithTx)
	const logs = [
		...listStake.map(add({_action: 'stake'})),
		...listUnstake.map(add({_action: 'unstake'})),
		...listWithdraw.map(add({_action: 'withdraw'})),
	]
	const records = await addCumulativeTotalRewards(logs)
	const sorted = sortByBlockNumber(records)

	await promisify(writeFile)(
		join(__dirname, '..', 'data', 'staking.json'),
		JSON.stringify(sorted)
	)
})().catch(console.error)
