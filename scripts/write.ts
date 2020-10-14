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
	MIGRATE_LOCKUP: migrateLockupAddress = '0xe43d4734f7dc7184e6d4afE0EC54C73b0ED922C6',
	MIGRATE_WITHDRAW: migrateWithdrawAddress = '0x09E989a431321fa953bF9167c215B50E3A90937f',
} = process.env

;(async () => {
	if (!infura || !mnemonic || !egsToken) return

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
				cHoldersAmountPerProperty:
					x.rewards.cumulativeHoldersRewardAmountPerProperty,
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
			cHoldersPrice:
				x.rewards
					.cumulativeHoldersRewardAmountPerPropertyForLastWithdrawnReward,
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
