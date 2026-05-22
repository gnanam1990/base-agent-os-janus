import { z } from 'zod';

export const ChainIdSchema = z.enum(['base', 'polygon', 'ethereum', 'optimism', 'arbitrum']);
export type ChainId = z.infer<typeof ChainIdSchema>;

export const ProfileSchema = z.object({
  identity_id: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  basename: z.string().optional(),
  base_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  eth_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  polygon_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  optimism_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  arbitrum_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  farcaster_fid: z.number().int().optional(),
  ethos_score: z.number().int().optional(),
  talent_score: z.number().int().optional(),
  github_login: z.string().optional(),
  verified_at: z.number().int(),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const LinkProofSchema = z.object({
  identity_id: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  chain_id: ChainIdSchema,
  chain_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  base_signature: z.string(),
  chain_signature: z.string(),
  nonce: z.string(),
  expires: z.number().int(),
});
export type LinkProof = z.infer<typeof LinkProofSchema>;
