import { ApiV3PoolInfoStandardItem, AmmV4Keys, AmmV5Keys } from '@raydium-io/raydium-sdk-v2'
import { initSdk, txVersion } from '../config'
import BN from 'bn.js'
import Decimal from 'decimal.js'
import { isValidAmm } from './utils'
import { PublicKey } from '@solana/web3.js'

export const withdrawLiquidity = async () => {
  const raydium = await initSdk()
  // RAY-USDC pool
  const poolId = 'FcZNWMNEyUrPY7GMqC92xiWV5otqjCHisUznFJApj8FH'
  let poolKeys: AmmV4Keys | AmmV5Keys | undefined
  let poolInfo: ApiV3PoolInfoStandardItem
  const withdrawLpAmount = new BN(1000) // please check your token account lpMint balance

  if (raydium.cluster === 'mainnet') {
    // note: api doesn't support get devnet pool info, so in devnet else we go rpc method
    // if you wish to get pool info from rpc, also can modify logic to go rpc method directly
    const data = await raydium.api.fetchPoolById({ ids: poolId })
    poolInfo = data[0] as ApiV3PoolInfoStandardItem
  } else {
    // note: getPoolInfoFromRpc method only return required pool data for computing not all detail pool info
    const data = await raydium.liquidity.getPoolInfoFromRpc({ poolId })
    poolInfo = data.poolInfo
    poolKeys = data.poolKeys
  }

  if (!isValidAmm(poolInfo.programId)) throw new Error('target pool is not AMM pool')
  const [baseRatio, quoteRatio] = [
    new Decimal(poolInfo.mintAmountA).div(poolInfo.lpAmount || 1),
    new Decimal(poolInfo.mintAmountB).div(poolInfo.lpAmount || 1),
  ]

  const withdrawAmountDe = new Decimal(withdrawLpAmount.toString()).div(10 ** poolInfo.lpMint.decimals)
  const [withdrawAmountA, withdrawAmountB] = [
    withdrawAmountDe.mul(baseRatio).mul(10 ** (poolInfo?.mintA.decimals || 0)),
    withdrawAmountDe.mul(quoteRatio).mul(10 ** (poolInfo?.mintB.decimals || 0)),
  ]

  const lpSlippage = 0.1 // means 1%

  const { execute } = await raydium.liquidity.removeLiquidity({
    poolInfo,
    poolKeys,
    lpAmount: withdrawLpAmount,
    baseAmountMin: new BN(withdrawAmountA.mul(1 - lpSlippage).toFixed(0)),
    quoteAmountMin: new BN(withdrawAmountB.mul(1 - lpSlippage).toFixed(0)),
    txVersion,
    // optional: set up priority fee here
    // computeBudgetConfig: {
    //   units: 600000,
    //   microLamports: 46591500,
    // },

    // optional: add transfer sol to tip account instruction. e.g sent tip to jito
    // txTipConfig: {
    //   address: new PublicKey('96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5'),
    //   amount: new BN(10000000), // 0.01 sol
    // },
  })

  // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
  const { txId } = await execute({ sendAndConfirm: true })
  console.log('liquidity withdraw:', { txId: `https://explorer.solana.com/tx/${txId}` })
  process.exit() // if you don't want to end up node execution, comment this line
}

/** uncomment code below to execute */
// withdrawLiquidity()
