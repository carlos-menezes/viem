import { describe, expect, test } from 'vitest'
import { accounts } from '~test/src/constants.js'
import { signTransaction } from '../../accounts/utils/signTransaction.js'
import { BaseError } from '../../errors/base.js'
import { InvalidChainIdError } from '../../errors/chain.js'
import { InvalidAddressError } from '../../index.js'
import {
  type TransactionSerializableEIP1559,
  parseEther,
  parseGwei,
  parseTransaction,
} from '../../index.js'
import { zkSyncTestnet } from '../index.js'
import { serializeTransactionZkSync } from './serializers.js'
import type { ZkSyncTransactionSerializableEIP712 } from './types.js'

const baseTransaction: TransactionSerializableEIP1559 = {
  to: '0x111C3E89Ce80e62EE88318C2804920D4c96f92bb',
  chainId: zkSyncTestnet.id,
  nonce: 7,
  maxFeePerGas: 250000000n,
  maxPriorityFeePerGas: 2n,
  value: parseEther('1'),
  data: '0xa4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000017900000000000000000000000000000000000000000000000000000000000000',
}

const baseEip712: ZkSyncTransactionSerializableEIP712 = {
  ...baseTransaction,
  from: '0xf760bdd822fccf93c44be68d94c45133002b3037',
  gasPerPubdata: 50000n,
  factoryDeps: [],
  paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021',
  paymasterInput:
    '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
  customSignature:
    '0xd2312deb1e84f7733a83ae1fc55f9cc1f2334fe472e0a494781933b194e173a45d927e67b9222b92467660849efb055422f133cf67588cbcb1874901d3244ddd1c',
  type: 'eip712',
}

describe('ZkSync - EIP712', () => {
  test('should be able to serializer a ZkSync EIP712 transaction', () => {
    const transaction: ZkSyncTransactionSerializableEIP712 = {
      ...baseEip712,
      gas: 158774n,
    }

    expect(serializeTransactionZkSync(transaction)).toMatchInlineSnapshot(
      '"0x71f901500702840ee6b28083026c3694111c3e89ce80e62ee88318c2804920d4c96f92bb880de0b6b3a7640000b864a4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000017900000000000000000000000000000000000000000000000000000000000000820118808082011894f760bdd822fccf93c44be68d94c45133002b303782c350c0b841d2312deb1e84f7733a83ae1fc55f9cc1f2334fe472e0a494781933b194e173a45d927e67b9222b92467660849efb055422f133cf67588cbcb1874901d3244ddd1cf85b944b5df730c2e6b28e17013a1485e5d9bc41efe021b8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"',
    )
  })

  test('gas', () => {
    const transaction: ZkSyncTransactionSerializableEIP712 = {
      ...baseEip712,
      gas: 69420n,
    }

    expect(serializeTransactionZkSync(transaction)).toMatchInlineSnapshot(
      '"0x71f901500702840ee6b28083010f2c94111c3e89ce80e62ee88318c2804920d4c96f92bb880de0b6b3a7640000b864a4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000017900000000000000000000000000000000000000000000000000000000000000820118808082011894f760bdd822fccf93c44be68d94c45133002b303782c350c0b841d2312deb1e84f7733a83ae1fc55f9cc1f2334fe472e0a494781933b194e173a45d927e67b9222b92467660849efb055422f133cf67588cbcb1874901d3244ddd1cf85b944b5df730c2e6b28e17013a1485e5d9bc41efe021b8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"',
    )
  })

  test('gasPerPubdata', () => {
    const transaction: ZkSyncTransactionSerializableEIP712 = {
      ...baseTransaction,
      from: '0xf760bdd822fccf93c44be68d94c45133002b3037',
      gasPerPubdata: 50000n,
      type: 'eip712',
    }

    expect(serializeTransactionZkSync(transaction)).toMatchInlineSnapshot(
      '"0x71f8af0702840ee6b2808094111c3e89ce80e62ee88318c2804920d4c96f92bb880de0b6b3a7640000b864a4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000017900000000000000000000000000000000000000000000000000000000000000820118808082011894f760bdd822fccf93c44be68d94c45133002b303782c350c080c0"',
    )
  })

  test('factoryDeps', () => {
    const transaction: ZkSyncTransactionSerializableEIP712 = {
      ...baseTransaction,
      from: '0xf760bdd822fccf93c44be68d94c45133002b3037',
      factoryDeps: ['0xABCDEF', '0x123456'],
      type: 'eip712',
    }

    expect(serializeTransactionZkSync(transaction)).toMatchInlineSnapshot(
      '"0x71f8b50702840ee6b2808094111c3e89ce80e62ee88318c2804920d4c96f92bb880de0b6b3a7640000b864a4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000017900000000000000000000000000000000000000000000000000000000000000820118808082011894f760bdd822fccf93c44be68d94c45133002b303780c883abcdef8312345680c0"',
    )
  })

  test('customSignature', () => {
    const transaction: ZkSyncTransactionSerializableEIP712 = {
      ...baseTransaction,
      from: '0xf760bdd822fccf93c44be68d94c45133002b3037',
      customSignature: '0xABCDEF',
      type: 'eip712',
    }

    expect(serializeTransactionZkSync(transaction)).toMatchInlineSnapshot(
      '"0x71f8b00702840ee6b2808094111c3e89ce80e62ee88318c2804920d4c96f92bb880de0b6b3a7640000b864a4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000017900000000000000000000000000000000000000000000000000000000000000820118808082011894f760bdd822fccf93c44be68d94c45133002b303780c083abcdefc0"',
    )
  })

  test('paymaster', () => {
    const transaction: ZkSyncTransactionSerializableEIP712 = {
      ...baseTransaction,
      from: '0xf760bdd822fccf93c44be68d94c45133002b3037',
      paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021',
      paymasterInput:
        '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
      type: 'eip712',
    }

    expect(serializeTransactionZkSync(transaction)).toMatchInlineSnapshot(
      '"0x71f901090702840ee6b2808094111c3e89ce80e62ee88318c2804920d4c96f92bb880de0b6b3a7640000b864a4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000017900000000000000000000000000000000000000000000000000000000000000820118808082011894f760bdd822fccf93c44be68d94c45133002b303780c080f85b944b5df730c2e6b28e17013a1485e5d9bc41efe021b8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"',
    )
  })

  test('without nonce', () => {
    const transaction: ZkSyncTransactionSerializableEIP712 = {
      ...baseEip712,
      nonce: undefined,
    }

    expect(serializeTransactionZkSync(transaction)).toMatchInlineSnapshot(
      '"0x71f9014d8002840ee6b2808094111c3e89ce80e62ee88318c2804920d4c96f92bb880de0b6b3a7640000b864a4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000017900000000000000000000000000000000000000000000000000000000000000820118808082011894f760bdd822fccf93c44be68d94c45133002b303782c350c0b841d2312deb1e84f7733a83ae1fc55f9cc1f2334fe472e0a494781933b194e173a45d927e67b9222b92467660849efb055422f133cf67588cbcb1874901d3244ddd1cf85b944b5df730c2e6b28e17013a1485e5d9bc41efe021b8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"',
    )
  })

  test('without fees', () => {
    const transaction: ZkSyncTransactionSerializableEIP712 = {
      ...baseEip712,
      maxFeePerGas: undefined,
      maxPriorityFeePerGas: undefined,
    }

    expect(serializeTransactionZkSync(transaction)).toMatchInlineSnapshot(
      '"0x71f901490780808094111c3e89ce80e62ee88318c2804920d4c96f92bb880de0b6b3a7640000b864a4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000017900000000000000000000000000000000000000000000000000000000000000820118808082011894f760bdd822fccf93c44be68d94c45133002b303782c350c0b841d2312deb1e84f7733a83ae1fc55f9cc1f2334fe472e0a494781933b194e173a45d927e67b9222b92467660849efb055422f133cf67588cbcb1874901d3244ddd1cf85b944b5df730c2e6b28e17013a1485e5d9bc41efe021b8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"',
    )
  })

  test('without to', () => {
    const transaction: ZkSyncTransactionSerializableEIP712 = {
      ...baseEip712,
      to: undefined,
    }

    expect(serializeTransactionZkSync(transaction)).toMatchInlineSnapshot(
      '"0x71f901390702840ee6b2808080880de0b6b3a7640000b864a4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000017900000000000000000000000000000000000000000000000000000000000000820118808082011894f760bdd822fccf93c44be68d94c45133002b303782c350c0b841d2312deb1e84f7733a83ae1fc55f9cc1f2334fe472e0a494781933b194e173a45d927e67b9222b92467660849efb055422f133cf67588cbcb1874901d3244ddd1cf85b944b5df730c2e6b28e17013a1485e5d9bc41efe021b8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"',
    )
  })

  test('without value', () => {
    const transaction: ZkSyncTransactionSerializableEIP712 = {
      ...baseEip712,
      value: undefined,
    }

    expect(serializeTransactionZkSync(transaction)).toMatchInlineSnapshot(
      '"0x71f901450702840ee6b2808094111c3e89ce80e62ee88318c2804920d4c96f92bb80b864a4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000017900000000000000000000000000000000000000000000000000000000000000820118808082011894f760bdd822fccf93c44be68d94c45133002b303782c350c0b841d2312deb1e84f7733a83ae1fc55f9cc1f2334fe472e0a494781933b194e173a45d927e67b9222b92467660849efb055422f133cf67588cbcb1874901d3244ddd1cf85b944b5df730c2e6b28e17013a1485e5d9bc41efe021b8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"',
    )
  })

  test('without data', () => {
    const transaction: ZkSyncTransactionSerializableEIP712 = {
      ...baseEip712,
      data: undefined,
    }

    expect(serializeTransactionZkSync(transaction)).toMatchInlineSnapshot(
      '"0x71f8e80702840ee6b2808094111c3e89ce80e62ee88318c2804920d4c96f92bb880de0b6b3a764000080820118808082011894f760bdd822fccf93c44be68d94c45133002b303782c350c0b841d2312deb1e84f7733a83ae1fc55f9cc1f2334fe472e0a494781933b194e173a45d927e67b9222b92467660849efb055422f133cf67588cbcb1874901d3244ddd1cf85b944b5df730c2e6b28e17013a1485e5d9bc41efe021b8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"',
    )
  })

  test('without from', () => {
    const transaction: ZkSyncTransactionSerializableEIP712 = {
      ...baseEip712,
      // @ts-expect-error
      from: undefined,
    }

    expect(serializeTransactionZkSync(transaction)).toMatchInlineSnapshot(
      '"0x71f901390702840ee6b2808094111c3e89ce80e62ee88318c2804920d4c96f92bb880de0b6b3a7640000b864a413686200000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001790000000000000000000000000000000000000000000000000000000000000082011880808201188082c350c0b841d2312deb1e84f7733a83ae1fc55f9cc1f2334fe472e0a494781933b194e173a45d927e67b9222b92467660849efb055422f133cf67588cbcb1874901d3244ddd1cf85b944b5df730c2e6b28e17013a1485e5d9bc41efe021b8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"',
    )
  })
})

test('signed with customSignature', async () => {
  const signed = await signTransaction({
    privateKey: accounts[0].privateKey,
    transaction: { ...baseEip712, gas: 158774n },
    serializer: serializeTransactionZkSync,
  })

  expect(signed).toMatchInlineSnapshot(
    '"0x71f901500702840ee6b28083026c3694111c3e89ce80e62ee88318c2804920d4c96f92bb880de0b6b3a7640000b864a4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000017900000000000000000000000000000000000000000000000000000000000000820118808082011894f760bdd822fccf93c44be68d94c45133002b303782c350c0b841d2312deb1e84f7733a83ae1fc55f9cc1f2334fe472e0a494781933b194e173a45d927e67b9222b92467660849efb055422f133cf67588cbcb1874901d3244ddd1cf85b944b5df730c2e6b28e17013a1485e5d9bc41efe021b8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"',
  )
})

describe('invalid params', () => {
  test('invalid paymaster', () => {
    const transaction: ZkSyncTransactionSerializableEIP712 = {
      ...baseEip712,
      paymaster: '0xdeadbeef',
    }
    expect(() => serializeTransactionZkSync(transaction)).toThrowError(
      InvalidAddressError,
    )
  })

  test('invalid chain', () => {
    const transaction: ZkSyncTransactionSerializableEIP712 = {
      ...baseEip712,
      paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021',
      chainId: -1,
    }
    expect(() => serializeTransactionZkSync(transaction)).toThrowError(
      InvalidChainIdError,
    )
  })

  test('invalid to', () => {
    const transaction: ZkSyncTransactionSerializableEIP712 = {
      ...baseEip712,
      paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021',
      to: '0xdeadbeef',
    }
    expect(() => serializeTransactionZkSync(transaction)).toThrowError(
      InvalidAddressError,
    )
  })

  test('invalid from', () => {
    const transaction: ZkSyncTransactionSerializableEIP712 = {
      ...baseEip712,
      paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021',
      from: '0xdeadbeef',
    }
    expect(() => serializeTransactionZkSync(transaction)).toThrowError(
      InvalidAddressError,
    )
  })

  test('missing paymaster', () => {
    const transaction: ZkSyncTransactionSerializableEIP712 = {
      ...baseTransaction,
      from: '0xf760bdd822fccf93c44be68d94c45133002b3037',
      paymasterInput:
        '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
      type: 'eip712',
    }
    expect(() => serializeTransactionZkSync(transaction)).toThrowError(
      BaseError,
    )
  })

  test('missing paymasterInput', () => {
    const transaction: ZkSyncTransactionSerializableEIP712 = {
      ...baseTransaction,
      from: '0xf760bdd822fccf93c44be68d94c45133002b3037',
      paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021',
      type: 'eip712',
    }
    expect(() => serializeTransactionZkSync(transaction)).toThrowError(
      BaseError,
    )
  })
})

describe('not eip712', () => {
  const transaction: TransactionSerializableEIP1559 = {
    to: accounts[0].address,
    chainId: 1,
    nonce: 0,
    maxFeePerGas: parseGwei('2'),
    maxPriorityFeePerGas: parseGwei('2'),
    value: parseEther('1'),
  }

  test('it calls the standard serializeTransactionZkSync', () => {
    const serialized = serializeTransactionZkSync(transaction)
    expect(serialized).toMatchInlineSnapshot(
      '"0x02ed0180847735940084773594008094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c0"',
    )
    expect(parseTransaction(serialized)).toEqual({
      to: accounts[0].address,
      chainId: 1,
      maxFeePerGas: parseGwei('2'),
      maxPriorityFeePerGas: parseGwei('2'),
      value: parseEther('1'),
      type: 'eip1559',
    })
  })
})
