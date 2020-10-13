import {writeFile} from 'fs'
import {promisify} from 'util'
import {join} from 'path'
import transactions from '../data/transactions.json'
import {compute} from './lib/compute'
;(async () => {
	await promisify(writeFile)(
		join(__dirname, '..', 'data', 'computed.json'),
		JSON.stringify(compute(transactions))
	)
})().catch(console.error)
