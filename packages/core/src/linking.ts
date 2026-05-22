import { keccak256, toHex } from 'viem';

export interface LinkMessageParams {
  identityId: string;
  baseAddress: string;
  chainId: number;
  chainAddress: string;
  nonce: bigint;
  expires: bigint;
}

export function linkMessage(p: LinkMessageParams): string {
  return [
    'Janus link',
    `identity: ${p.identityId}`,
    `base_address: ${p.baseAddress}`,
    `chain_id: ${p.chainId}`,
    `chain_address: ${p.chainAddress}`,
    `nonce: ${p.nonce.toString()}`,
    `expires: ${p.expires.toString()}`,
  ].join('\n');
}

export function linkMessageHash(p: LinkMessageParams): `0x${string}` {
  return keccak256(toHex(linkMessage(p)));
}
