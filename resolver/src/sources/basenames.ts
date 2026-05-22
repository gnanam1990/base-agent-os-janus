import { createPublicClient, http, namehash } from 'viem';
import { normalize } from 'viem/ens';
import { base } from 'viem/chains';

const RESOLVER_ADDRESS = '0xC6d566A56A1aFf6508b41f6c90ff131615583BCD';

const L2_RESOLVER_ABI = [
  {
    name: 'addr',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'string' }],
  },
] as const;

const client = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_MAINNET_RPC),
});

export async function resolveBasename(basename: string): Promise<string | null> {
  try {
    const normalized = normalize(basename);
    const node = namehash(normalized);
    const address = await client.readContract({
      address: RESOLVER_ADDRESS,
      abi: L2_RESOLVER_ABI,
      functionName: 'addr',
      args: [node],
    });
    return address && address !== '0x0000000000000000000000000000000000000000' ? address : null;
  } catch {
    return null;
  }
}

export async function reverseBasename(address: string): Promise<string | null> {
  try {
    const node = namehash(`${address.slice(2).toLowerCase()}.addr.reverse`);
    const name = await client.readContract({
      address: RESOLVER_ADDRESS,
      abi: L2_RESOLVER_ABI,
      functionName: 'name',
      args: [node],
    });
    return name || null;
  } catch {
    return null;
  }
}
