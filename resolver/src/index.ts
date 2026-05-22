import { keccak256, toHex } from 'viem';
import { resolveBasename, reverseBasename } from './sources/basenames.js';
import { resolveEns, reverseEns } from './sources/ens.js';
import { farcasterByAddress } from './sources/farcaster.js';
import { ethosByAddress } from './sources/ethos.js';
import { talentByAddress } from './sources/talent.js';
import { githubByLogin } from './sources/github.js';

export interface Profile {
  identity_id: string;
  basename?: string;
  base_address: string;
  eth_address?: string;
  polygon_address?: string;
  optimism_address?: string;
  arbitrum_address?: string;
  farcaster_fid?: number;
  ethos_score?: number;
  talent_score?: number;
  github_login?: string;
  verified_at: number;
}

export type Seed =
  | { basename: string }
  | { ens: string }
  | { address: string }
  | { fid: number };

export { resolveBasename, reverseBasename, resolveEns, reverseEns, farcasterByAddress, ethosByAddress, talentByAddress, githubByLogin };

export async function aggregateProfile(seed: Seed): Promise<Profile> {
  let baseAddress: string | null = null;

  if ('basename' in seed) {
    baseAddress = await resolveBasename(seed.basename);
    if (!baseAddress) throw new Error(`Basename not found: ${seed.basename}`);
  } else if ('ens' in seed) {
    baseAddress = await resolveEns(seed.ens);
    if (!baseAddress) throw new Error(`ENS not found: ${seed.ens}`);
  } else if ('address' in seed) {
    baseAddress = seed.address;
  } else if ('fid' in seed) {
    throw new Error('FID resolution requires Neynar API lookup not yet implemented');
  }

  if (!baseAddress) throw new Error('Could not resolve to address');

  const [basename, ensName, farcaster, ethos, talent] = await Promise.all([
    reverseBasename(baseAddress),
    reverseEns(baseAddress),
    farcasterByAddress(baseAddress),
    ethosByAddress(baseAddress),
    talentByAddress(baseAddress),
  ]);

  let githubProfile = null;
  if (talent?.github_login) {
    githubProfile = await githubByLogin(talent.github_login);
  }

  const identityId = keccak256(toHex(baseAddress));

  return {
    identity_id: identityId,
    basename: basename || undefined,
    base_address: baseAddress,
    eth_address: baseAddress,
    farcaster_fid: farcaster?.fid,
    ethos_score: ethos?.ethos_score,
    talent_score: talent?.talent_score,
    github_login: talent?.github_login || undefined,
    verified_at: Math.floor(Date.now() / 1000),
  };
}
