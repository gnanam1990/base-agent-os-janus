import { Hono } from 'hono';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { janusRegistryAbi } from '@janus/core';

const identityRouter = new Hono();

const REGISTRY_ADDRESS = (process.env.JANUS_REGISTRY_ADDR || '0x0') as `0x${string}`;

const client = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_MAINNET_RPC),
});

identityRouter.get('/api/identity/:seed', async (c) => {
  try {
    const seed = c.req.param('seed');

    return c.json({
      identity_id: '0x0000000000000000000000000000000000000000000000000000000000000000',
      base_address: '0x0000000000000000000000000000000000000000',
      basename: null,
      farcaster_username: null,
      seed,
      message: 'Full resolution requires /api/identity/:seed/full endpoint',
    });
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

identityRouter.get('/api/identity/:seed/full', async (c) => {
  try {
    const seed = c.req.param('seed');

    return c.json({
      identity_id: '0x0000000000000000000000000000000000000000000000000000000000000000',
      base_address: '0x0000000000000000000000000000000000000000',
      seed,
      message: 'Full aggregation not yet configured. Set resolver environment variables.',
    });
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

identityRouter.get('/api/identity/:id/onchain', async (c) => {
  try {
    const identityId = c.req.param('id') as `0x${string}`;

    if (!identityId.startsWith('0x') || identityId.length !== 66) {
      return c.json({ error: 'Invalid identity_id format' }, 400);
    }

    const result = await client.readContract({
      address: REGISTRY_ADDRESS,
      abi: janusRegistryAbi,
      functionName: 'getProfile',
      args: [identityId],
    });

    return c.json({
      identity: result[0],
      chain_addresses: result[1],
    });
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

identityRouter.get('/health', (c) => c.json({ ok: true, service: 'janus' }));

identityRouter.get('/openapi.json', (c) =>
  c.json({
    openapi: '3.0.0',
    info: { title: 'Janus Identity API', version: '0.1.0' },
    paths: {
      '/api/identity/{seed}': {
        get: {
          summary: 'Resolve identity by seed',
          parameters: [{ name: 'seed', in: 'path', required: true, schema: { type: 'string' } }],
        },
      },
      '/api/identity/{seed}/full': {
        get: {
          summary: 'Full identity aggregation',
          parameters: [{ name: 'seed', in: 'path', required: true, schema: { type: 'string' } }],
        },
      },
      '/api/identity/{id}/onchain': {
        get: {
          summary: 'On-chain identity lookup',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        },
      },
    },
  })
);

export { identityRouter };
