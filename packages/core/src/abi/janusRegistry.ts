export const janusRegistryAbi = [
  {
    type: 'function',
    name: 'setAgent',
    inputs: [{ name: 'newAgent', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'recordIdentity',
    inputs: [
      { name: 'identityId', type: 'bytes32' },
      { name: 'baseAddress', type: 'address' },
      { name: 'basename', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'recordLink',
    inputs: [
      { name: 'identityId', type: 'bytes32' },
      { name: 'chainId', type: 'string' },
      { name: 'chainAddress', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getIdentity',
    inputs: [{ name: 'identityId', type: 'bytes32' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'baseAddress', type: 'address' },
          { name: 'basename', type: 'string' },
          { name: 'verifiedAt', type: 'uint256' },
          { name: 'links', type: 'string[]' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'agent',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'IdentityRecorded',
    inputs: [
      { name: 'identityId', type: 'bytes32', indexed: true },
      { name: 'baseAddress', type: 'address', indexed: true },
      { name: 'basename', type: 'string', indexed: false },
      { name: 'verifiedAt', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'LinkRecorded',
    inputs: [
      { name: 'identityId', type: 'bytes32', indexed: true },
      { name: 'chainId', type: 'string', indexed: false },
      { name: 'chainAddress', type: 'address', indexed: true },
    ],
  },
] as const;
