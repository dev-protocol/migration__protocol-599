import {writeFile} from 'fs'
import {promisify} from 'util'
import {join} from 'path'
import stakingRecords from '../data/staking.json'
import {compute} from './lib/compute'
;(async () => {
	await promisify(writeFile)(
		join(__dirname, '..', 'data', 'computed.json'),
		JSON.stringify(compute(stakingRecords))
	)
})().catch(console.error)
