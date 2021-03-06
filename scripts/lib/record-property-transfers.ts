import {Log} from '@ethersproject/abstract-provider'
import {createWallet} from './client'
import {createToken} from './token'
import {config} from 'dotenv'
import bent from 'bent'
import {queueAll} from './queue'
config()

type GraphQLPropertyFactoryCreateResponse = {
	data: {
		property_factory_create: Array<{
			property: string
		}>
	}
}

const propertyFetcher = async (
	offset = 0
): Promise<GraphQLPropertyFactoryCreateResponse> =>
	bent(
		'https://api.devprtcl.com/v1/graphql',
		'POST',
		'json'
	)('/', {
		query: `{
				property_factory_create(
					offset: ${offset}
				) {
					property
				}
			}`,
	}).then((r) => (r as unknown) as GraphQLPropertyFactoryCreateResponse)

const fetchAllProperties = async () =>
	new Promise<
		GraphQLPropertyFactoryCreateResponse['data']['property_factory_create']
	>((resolve) => {
		const f = async (
			i = 0,
			prev: GraphQLPropertyFactoryCreateResponse['data']['property_factory_create'] = []
		): Promise<void> => {
			const {data} = await propertyFetcher(i)
			const {property_factory_create: items} = data
			const next = [...prev, ...items]
			if (items.length > 0) {
				f(i + items.length, next).catch(console.error)
			} else {
				resolve(next)
			}
		}

		f().catch(console.error)
	})

export const propertyTransfers = async (
	infura: string,
	mnemonic: string,
	_toBlock: string
): Promise<Log[]> => {
	const [wallet, provider] = createWallet(infura, mnemonic)

	const propertyInterfaceFactory = createToken(wallet)

	const allProperties = await fetchAllProperties()

	const toBlock = Number(_toBlock)
	const allEventFilters = allProperties.map(({property}) =>
		propertyInterfaceFactory(property).filters.Transfer()
	)
	const allEventLogs = await queueAll('allPropertyTransfers')(
		allEventFilters.map((filter) => async () =>
			provider.getLogs({...filter, toBlock})
		)
	)

	return allEventLogs.flat()
}
