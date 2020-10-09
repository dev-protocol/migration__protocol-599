import {ethers} from 'ethers'

export const createProvider = (infura: string): ethers.providers.BaseProvider =>
	new ethers.providers.InfuraProvider('homestead', infura)

export const createWallet = (
	infura: string,
	phrase: string
): [ethers.Wallet, ethers.providers.BaseProvider] => {
	const prov = createProvider(infura)
	return [ethers.Wallet.fromMnemonic(phrase).connect(prov), prov]
}
