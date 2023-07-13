import { Wallet, utils } from 'zksync-web3'
import * as ethers from 'ethers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { Deployer } from '@matterlabs/hardhat-zksync-deploy'

// load env file
import dotenv from 'dotenv'
dotenv.config()

// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || ''
const NODE_ENV = process.env.NODE_ENV || 'test'

if (!PRIVATE_KEY) throw '⛔️ Private key not detected! Add it to the .env file!'

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
	console.log(`开始部署测试合约。。。。`)

	// Initialize the wallet.
	const wallet = new Wallet(PRIVATE_KEY)

	// Create deployer object and load the artifact of the contract you want to deploy.
	const deployer = new Deployer(hre, wallet)
	const artifact = await deployer.loadArtifact('ContractFactory')

	const deploymentFee = await deployer.estimateDeployFee(artifact, [])

	const parsedFee = ethers.utils.formatEther(deploymentFee.toString())
	console.log(`本次部署预计花费 ${parsedFee} ETH`)

	const contractFactory = await deployer.deploy(artifact, [])

	// Show the contract info.
	const contractAddress = contractFactory.address
	console.log(`${artifact.contractName} 已部署到 ${contractAddress}`)

	// 调用合约方法
	console.log(`调用合约方法。。。。`)
	const tx = await contractFactory.deploy_new2(666)
	await tx.wait()
	// verify contract for tesnet & mainnet
	if (NODE_ENV === 'test') {
		// Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
		const contractFullyQualifedName =
			'contracts/ContractFactoryV1.sol:ContractFactory'

		// Verify contract programmatically
		const verificationId = await hre.run('verify:verify', {
			address: contractAddress, // 待验证的合约地址
			contract: contractFullyQualifedName, // 合约全名 文件路径/文件名:合约名
			constructorArguments: [], //构造函数参数
			bytecode: artifact.bytecode, //字节码
		})

		// verify id
		console.log(`Contract verified with id: ${verificationId}`) // 如果验证不成功，返回-1
	} else {
		console.log(`Contract not verified, deployed locally.`)
	}
}

// $ /Users/ouhuang/Documents/zksync-hardhat-template/node_modules/.bin/hardhat deploy-zksync --script deploy-test.ts
// 开始部署测试合约。。。。
// 本次部署预计花费 0.000134341 ETH
// ContractFactory 已部署到 0x0457ddcCad988Beb574bC7c0B498E17cef0fc7A5
// 调用合约方法。。。。
// Compiling contracts for zkSync Era with zksolc v1.3.13 and solc v0.8.17
// Compiling 1 Solidity file

// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
// │ Warning: Your code or one of its dependencies uses the 'extcodesize' instruction, which is       │
// │ usually needed in the following cases:                                                           │
// │   1. To detect whether an address belongs to a smart contract.                                   │
// │   2. To detect whether the deploy code execution has finished.                                   │
// │ zkSync Era comes with native account abstraction support (so accounts are smart contracts,       │
// │ including private-key controlled EOAs), and you should avoid differentiating between contracts   │
// │ and non-contract addresses.                                                                      │
// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
// --> contracts/ContractFactoryV1.sol

// Your verification ID is: 31528
// Contract successfully verified on zkSync block explorer!
// Contract verified with id: 31528
// ✨  Done in 45.04s.
