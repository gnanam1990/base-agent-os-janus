import { createPublicClient, http, namehash } from 'viem';
import { normalize } from 'viem/ens';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
  chain: mainnet,
  transport: http(process.env.ETH_MAINNET_RPC),
});

export async function resolveEns(name: string): Promise<string | null> {
  try {
    const normalized = normalize(name);
    const address = await client.getEnsAddress({ name: normalized });
    return address || null;
  } catch {
    return null;
  }
}

export async function reverseEns(address: string): Promise<string | null> {
  try {
    const name = await client.getEnsName({ address: address as `0x${string}` });
    return name || null;
  } catch {
    return null;
  }
}
