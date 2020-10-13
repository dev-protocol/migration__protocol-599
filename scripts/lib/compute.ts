import transactions from '../../data/transactions.json'
import {BigNumber} from 'ethers'
import {toBigNumber} from './number'
import {ACTIONS, BASIS, HOLDERS_SHARE} from './constants'
import {sortByBlockNumber} from './collection'

type Rewards = {
	transactionHash: string
	blockNumber: number
	action: string
	hookedUser: string
	hookedProperty: string
	rewards: {
		total: string
		interestPrice: string
		holdersPrice: string
		holdersPriceForLastWithdrawnReward: string
		cumulativeHoldersAmountPerProperty: string
	}
}

const zero = toBigNumber(0)

const storage: Map<
	| 'LastCumulativeReward'
	| 'LastCumulativeHoldersRewardPrice'
	| 'LastCumulativeInterestPrice',
	BigNumber
> = new Map()

const lastCumulativeHoldersRewardsPerProperty: Map<
	string,
	{
		amount: BigNumber
		price: BigNumber
	}
> = new Map()

export const compute = (records: typeof transactions): Rewards[] =>
	sortByBlockNumber(records).map(
		(record): Rewards => {
			const action = record._action
			const transactionHash = record.transactionHash
			const blockNumber = record.blockNumber
			const hookedUser = record._transaction.from
			const hookedProperty = record._property
			const totalStaked = toBigNumber(record._totalStakedLast)
			const propertyStaked = record._thePropertyStakedLast
			const totalReward = toBigNumber(record._cumulativeTotalRewards)

			// Get last values from storage
			const lastCReward = storage.get('LastCumulativeReward') ?? zero // Previous value of `mTotal`
			const lastCHoldersReward =
				storage.get('LastCumulativeHoldersRewardPrice') ?? zero // Previous value of `holdersPrice`
			const lastCInterest = storage.get('LastCumulativeInterestPrice') ?? zero // Previous value of `interestPrice`

			// Compute latest global values
			const mTotal = totalReward.mul(BASIS)
			const price = totalStaked.isZero()
				? zero
				: mTotal.sub(lastCReward).div(totalStaked)
			const holdersShare = price.mul(HOLDERS_SHARE).div(100)
			const holdersPrice = holdersShare.add(lastCHoldersReward)
			const interestPrice = price.sub(holdersShare).add(lastCInterest)

			// Compute latest values about the Property
			const lastCHoldersPProperty = lastCumulativeHoldersRewardsPerProperty.get(
				hookedProperty
			)
			const cumulativeHoldersAmountPerProperty = holdersPrice
				.sub(lastCHoldersPProperty?.price ?? zero)
				.mul(propertyStaked)
				.add(lastCHoldersPProperty?.amount ?? zero)

			// Store computed latest values
			if (action === ACTIONS.STAKE || action === ACTIONS.UNSTAKE) {
				storage.set('LastCumulativeReward', mTotal)
				storage.set('LastCumulativeHoldersRewardPrice', holdersPrice)
				storage.set('LastCumulativeInterestPrice', interestPrice)
				lastCumulativeHoldersRewardsPerProperty.set(hookedProperty, {
					amount: cumulativeHoldersAmountPerProperty,
					price: holdersPrice,
				})
			}

			const holdersPriceForLastWithdrawnReward = holdersPrice
				.sub(lastCHoldersPProperty?.price ?? zero)
				.mul(record._thePropertyStaked)
				.add(lastCHoldersPProperty?.amount ?? zero)

			return {
				transactionHash,
				blockNumber,
				action,
				hookedUser,
				hookedProperty,
				rewards: {
					total: mTotal.toString(),
					interestPrice: interestPrice.toString(),
					holdersPrice: holdersPrice.toString(),
					holdersPriceForLastWithdrawnReward: holdersPriceForLastWithdrawnReward.toString(),
					cumulativeHoldersAmountPerProperty: cumulativeHoldersAmountPerProperty.toString(),
				},
			}
		}
	)
