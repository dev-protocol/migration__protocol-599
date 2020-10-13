import {config} from 'dotenv'
import {createWallet} from './lib/client'
import {
	createInitLastStakeOnPropertySender,
	createInitLastStakeSender,
	createInitStakeOnPropertySender,
	createLockup,
} from './lib/lockup'
import Queue from 'p-queue'
import records from '../data/dry.json'
import {createInitLastWithdrawSender, createWithdraw} from './lib/withdraw'
import {ethgas} from './lib/ethgas'
config()

const {
	INFURA: infura,
	MNEMONIC: mnemonic,
	EGS_TOKEN: egsToken,
	MIGRATE_LOCKUP: migrateLockupAddress,
	MIGRATE_WITHDRAW: migrateWithdrawAddress,
} = process.env

;(async () => {
	if (
		!infura ||
		!mnemonic ||
		!egsToken ||
		!migrateLockupAddress ||
		!migrateWithdrawAddress
	)
		return

	const [wallet] = createWallet(infura, mnemonic)
	const lockup = createLockup(wallet)(migrateLockupAddress)
	const withdraw = createWithdraw(wallet)(migrateWithdrawAddress)
	const gasPriceFetcher = ethgas(egsToken)('fastest')
	const initStakeOnProperty = createInitStakeOnPropertySender(
		lockup,
		gasPriceFetcher
	)
	const initLastStakeOnProperty = createInitLastStakeOnPropertySender(
		lockup,
		gasPriceFetcher
	)
	const initLastStake = createInitLastStakeSender(lockup, gasPriceFetcher)
	const initLastWithdraw = createInitLastWithdrawSender(
		withdraw,
		gasPriceFetcher
	)

	let count = 0
	const queue = new Queue({concurrency: 2}).on('active', () => {
		console.log(
			`Working on item #${++count}.  Size: ${queue.size}  Pending: ${
				queue.pending
			}`
		)
	})
	const {
		__initStakeOnProperty,
		__initLastStakeOnProperty,
		__initLastStake,
		__initLastWithdraw,
	} = records
	const initStakeOnPropertyTasks = __initStakeOnProperty.map((x) => async () =>
		initStakeOnProperty({
			property: x.hookedProperty,
			user: x.hookedUser,
			cInterestPrice: x.rewards.interestPrice,
		})
	)
	const initLastStakeOnPropertyTasks = __initLastStakeOnProperty.map(
		(x) => async () =>
			initLastStakeOnProperty({
				property: x.hookedProperty,
				cHoldersAmountPerProperty: x.rewards.cumulativeHoldersAmountPerProperty,
				cHoldersPrice: x.rewards.holdersPrice,
			})
	)
	const initLastStakeTasks = __initLastStake.map((x) => async () =>
		initLastStake({
			cReward: x.rewards.total,
			cInterestPrice: x.rewards.interestPrice,
			cHoldersPrice: x.rewards.holdersPrice,
		})
	)
	const initLastWithdrawTasks = __initLastWithdraw.map((x) => async () =>
		initLastWithdraw({
			property: x.hookedProperty,
			user: x.hookedUser,
			cHoldersPrice: x.rewards.holdersPrice,
		})
	)
	const allTasks = [
		...initStakeOnPropertyTasks,
		...initLastStakeOnPropertyTasks,
		...initLastStakeTasks,
		...initLastWithdrawTasks,
	]

	await queue.addAll(allTasks)
})().catch(console.error)
