import {compute} from '../scripts/lib/compute'
import transactions from '../data/transactions.json'
import {expect} from 'chai'

describe('scripts/lib/compute', () => {
	it('Returns calculation result by the expected way', () => {
		const dummy: typeof transactions = ([
			{
				transactionHash: '0x01',
				blockNumber: 1,
				_action: 'stake',
				_transaction: {
					from: '0xA',
				},
				_property: '0xProperty1',
				_totalStaked: '1',
				_totalStakedLast: '0',
				_thePropertyStaked: '1',
				_thePropertyStakedLast: '0',
				_cumulativeTotalRewards: '100',
			},
			{
				transactionHash: '0x02',
				blockNumber: 2,
				_action: 'stake',
				_transaction: {
					from: '0xA',
				},
				_property: '0xProperty1',
				_totalStaked: '5',
				_totalStakedLast: '1',
				_thePropertyStaked: '5',
				_thePropertyStakedLast: '1',
				_cumulativeTotalRewards: '200',
			},
			{
				transactionHash: '0x03',
				blockNumber: 3,
				_action: 'stake',
				_transaction: {
					from: '0xA',
				},
				_property: '0xProperty2',
				_totalStaked: '8',
				_totalStakedLast: '5',
				_thePropertyStaked: '3',
				_thePropertyStakedLast: '0',
				_cumulativeTotalRewards: '300',
			},
			{
				transactionHash: '0x04',
				blockNumber: 4,
				_action: 'unstake',
				_transaction: {
					from: '0xA',
				},
				_property: '0xProperty1',
				_totalStaked: '7',
				_totalStakedLast: '8',
				_thePropertyStaked: '4',
				_thePropertyStakedLast: '5',
				_cumulativeTotalRewards: '400',
			},
			{
				transactionHash: '0x05',
				blockNumber: 5,
				_action: 'withdraw',
				_transaction: {
					from: '0xA',
				},
				_property: '0xProperty1',
				_totalStaked: '7',
				_totalStakedLast: '7',
				_thePropertyStaked: '4',
				_thePropertyStakedLast: '4',
				_cumulativeTotalRewards: '500',
			},
		] as unknown) as typeof transactions
		const result = compute(dummy)
		const expected: ReturnType<typeof compute> = [
			{
				transactionHash: '0x01',
				blockNumber: 1,
				action: 'stake',
				hookedUser: '0xA',
				hookedProperty: '0xProperty1',
				rewards: {
					total: '100000000000000000000',
					interestPrice: '0',
					holdersPrice: '0',
					holdersPriceForLastWithdrawnReward: '0',
					cumulativeHoldersAmountPerProperty: '0',
				},
			},
			{
				transactionHash: '0x02',
				blockNumber: 2,
				action: 'stake',
				hookedUser: '0xA',
				hookedProperty: '0xProperty1',
				rewards: {
					total: '200000000000000000000',
					interestPrice: '49000000000000000000',
					holdersPrice: '51000000000000000000',
					holdersPriceForLastWithdrawnReward: '255000000000000000000',
					cumulativeHoldersAmountPerProperty: '51000000000000000000',
				},
			},
			{
				transactionHash: '0x03',
				blockNumber: 3,
				action: 'stake',
				hookedUser: '0xA',
				hookedProperty: '0xProperty2',
				rewards: {
					total: '300000000000000000000',
					interestPrice: '58800000000000000000',
					holdersPrice: '61200000000000000000',
					holdersPriceForLastWithdrawnReward: '183600000000000000000',
					cumulativeHoldersAmountPerProperty: '0',
				},
			},
			{
				transactionHash: '0x04',
				blockNumber: 4,
				action: 'unstake',
				hookedUser: '0xA',
				hookedProperty: '0xProperty1',
				rewards: {
					total: '400000000000000000000',
					interestPrice: '64925000000000000000',
					holdersPrice: '67575000000000000000',
					holdersPriceForLastWithdrawnReward: '117300000000000000000',
					cumulativeHoldersAmountPerProperty: '133875000000000000000',
				},
			},
			{
				transactionHash: '0x05',
				blockNumber: 5,
				action: 'withdraw',
				hookedUser: '0xA',
				hookedProperty: '0xProperty1',
				rewards: {
					total: '500000000000000000000',
					interestPrice: '71925000000000000000',
					holdersPrice: '74860714285714285714',
					holdersPriceForLastWithdrawnReward: '163017857142857142856',
					cumulativeHoldersAmountPerProperty: '163017857142857142856',
				},
			},
		]
		expect(result).to.be.deep.equal(expected)
	})
})
