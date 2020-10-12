import {writeFile} from 'fs'
import {promisify} from 'util'
import {join} from 'path'
import computed from '../data/computed.json'
import {dry} from './lib/dry'
;(async () => {
	await promisify(writeFile)(
		join(__dirname, '..', 'data', 'dry.json'),
		JSON.stringify(dry(computed))
	)
})().catch(console.error)
