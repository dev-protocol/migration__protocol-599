import {dry} from '../scripts/lib/dry'
import computedRecords from '../data/computed.json'
import {expect} from 'chai'

describe('scripts/lib/dry', () => {
	it('Returns organized result by the expected way', () => {
		const dummy: typeof computedRecords = ([
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
				hookedUser: '0xB',
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
			{
				transactionHash: '0x06',
				blockNumber: 6,
				action: 'stake',
				hookedUser: '0xC',
				hookedProperty: '0xProperty3',
				rewards: {
					total: '400000000000000000000',
					interestPrice: '64925000000000000000',
					holdersPrice: '67575000000000000000',
					holdersPriceForLastWithdrawnReward: '117300000000000000000',
					cumulativeHoldersAmountPerProperty: '133875000000000000000',
				},
			},
			{
				transactionHash: '0x07',
				blockNumber: 7,
				action: 'withdraw',
				hookedUser: '0xB',
				hookedProperty: '0xProperty1',
				rewards: {
					total: '500000000000000000000',
					interestPrice: '71925000000000000000',
					holdersPrice: '74860714285714285714',
					holdersPriceForLastWithdrawnReward: '163017857142857142856',
					cumulativeHoldersAmountPerProperty: '163017857142857142856',
				},
			},
		] as unknown) as typeof computedRecords
		const result = dry(dummy)
		const expected: ReturnType<typeof dry> = {
			__initStakeOnProperty: [
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
					transactionHash: '0x02',
					blockNumber: 2,
					action: 'stake',
					hookedUser: '0xB',
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
					transactionHash: '0x06',
					blockNumber: 6,
					action: 'stake',
					hookedUser: '0xC',
					hookedProperty: '0xProperty3',
					rewards: {
						total: '400000000000000000000',
						interestPrice: '64925000000000000000',
						holdersPrice: '67575000000000000000',
						holdersPriceForLastWithdrawnReward: '117300000000000000000',
						cumulativeHoldersAmountPerProperty: '133875000000000000000',
					},
				},
			],
			__initLastStakeOnProperty: [
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
					transactionHash: '0x06',
					blockNumber: 6,
					action: 'stake',
					hookedUser: '0xC',
					hookedProperty: '0xProperty3',
					rewards: {
						total: '400000000000000000000',
						interestPrice: '64925000000000000000',
						holdersPrice: '67575000000000000000',
						holdersPriceForLastWithdrawnReward: '117300000000000000000',
						cumulativeHoldersAmountPerProperty: '133875000000000000000',
					},
				},
			],
			__initLastStake: [
				{
					transactionHash: '0x06',
					blockNumber: 6,
					action: 'stake',
					hookedUser: '0xC',
					hookedProperty: '0xProperty3',
					rewards: {
						total: '400000000000000000000',
						interestPrice: '64925000000000000000',
						holdersPrice: '67575000000000000000',
						holdersPriceForLastWithdrawnReward: '117300000000000000000',
						cumulativeHoldersAmountPerProperty: '133875000000000000000',
					},
				},
			],
			__initLastWithdraw: [
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
				{
					transactionHash: '0x07',
					blockNumber: 7,
					action: 'withdraw',
					hookedUser: '0xB',
					hookedProperty: '0xProperty1',
					rewards: {
						total: '500000000000000000000',
						interestPrice: '71925000000000000000',
						holdersPrice: '74860714285714285714',
						holdersPriceForLastWithdrawnReward: '163017857142857142856',
						cumulativeHoldersAmountPerProperty: '163017857142857142856',
					},
				},
			],
		}
		expect(result).to.be.deep.equal(expected)
	})
})
