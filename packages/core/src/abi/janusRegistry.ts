export const janusRegistryAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'initialAgent',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addressToIdentity',
    inputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'agent',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'chainAddresses',
    inputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getProfile',
    inputs: [
      {
        name: 'identityId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'identity',
        type: 'tuple',
        internalType: 'struct JanusRegistry.Identity',
        components: [
          {
            name: 'identityId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'baseAddress',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'basenameHash',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'verifiedAt',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'attestationUID',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'linkedChainsBitmap',
            type: 'uint16',
            internalType: 'uint16',
          },
        ],
      },
      {
        name: 'chainAddrs',
        type: 'address[5]',
        internalType: 'address[5]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'identities',
    inputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'identityId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'baseAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'basenameHash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'verifiedAt',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'attestationUID',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'linkedChainsBitmap',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isNonceUsed',
    inputs: [
      {
        name: 'identityId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'nonce',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'linkChain',
    inputs: [
      {
        name: 'identityId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'chainBit',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: 'addr',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'baseSig',
        type: 'bytes',
        internalType: 'bytes',
      },
      {
        name: 'chainSig',
        type: 'bytes',
        internalType: 'bytes',
      },
      {
        name: 'nonce',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'expires',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'registerIdentity',
    inputs: [
      {
        name: 'identityId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'baseAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'basenameHash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'attestationUID',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setAgent',
    inputs: [
      {
        name: 'newAgent',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unlinkChain',
    inputs: [
      {
        name: 'identityId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'chainBit',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'ChainLinked',
    inputs: [
      {
        name: 'identityId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'chainBit',
        type: 'uint16',
        indexed: true,
        internalType: 'uint16',
      },
      {
        name: 'chainAddress',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ChainUnlinked',
    inputs: [
      {
        name: 'identityId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'chainBit',
        type: 'uint16',
        indexed: true,
        internalType: 'uint16',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'IdentityRegistered',
    inputs: [
      {
        name: 'identityId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'baseAddress',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'basenameHash',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'verifiedAt',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      {
        name: 'previousOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AlreadyLinked',
    inputs: [],
  },
  {
    type: 'error',
    name: 'IdentityExists',
    inputs: [],
  },
  {
    type: 'error',
    name: 'IdentityUnknown',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidChainBit',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidSignature',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NonceUsed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotAgent',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotIdentityOwner',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotLinked',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OwnableInvalidOwner',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'OwnableUnauthorizedAccount',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'SignatureExpired',
    inputs: [],
  },
] as const;
