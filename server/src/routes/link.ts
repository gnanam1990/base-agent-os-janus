import { Hono } from 'hono';
import { ethers } from 'ethers';
import { linkMessage, type LinkMessageParams } from '@janus/core';

const linkRouter = new Hono();

const CHAIN_IDS: Record<number, number> = {
  0: 8453,    // Base
  1: 137,     // Polygon
  2: 1,       // Ethereum
  3: 10,      // Optimism
  4: 42161,   // Arbitrum
};

linkRouter.post('/api/identity/:id/link', async (c) => {
  try {
    const identityId = c.req.param('id');
    const body = await c.req.json();
    const { chain_id, chain_address, base_signature, chain_signature, nonce, expires } = body;

    if (!chain_id || !chain_address || !base_signature || !chain_signature || !nonce || !expires) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    if (expires < Math.floor(Date.now() / 1000)) {
      return c.json({ error: 'Signature expired' }, 400);
    }

    const numericChainId = CHAIN_IDS[chain_id];
    if (!numericChainId) {
      return c.json({ error: 'Invalid chain_id' }, 400);
    }

    const baseAddress = process.env.AGENT_WALLET;
    if (!baseAddress) {
      return c.json({ error: 'Server configuration error' }, 500);
    }

    const msgParams: LinkMessageParams = {
      identityId,
      baseAddress,
      chainId: numericChainId,
      chainAddress: chain_address,
      nonce: BigInt(nonce),
      expires: BigInt(expires),
    };

    const message = linkMessage(msgParams);

    const baseSigner = ethers.verifyMessage(message, base_signature);
    if (baseSigner.toLowerCase() !== baseAddress.toLowerCase()) {
      return c.json({ error: 'Invalid base signature' }, 400);
    }

    const chainSigner = ethers.verifyMessage(message, chain_signature);
    if (chainSigner.toLowerCase() !== chain_address.toLowerCase()) {
      return c.json({ error: 'Invalid chain signature' }, 400);
    }

    return c.json({
      status: 'verified',
      identity_id: identityId,
      chain_id,
      chain_address,
      message: 'Signatures verified. Submit to JanusRegistry.linkChain on-chain.',
    });
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

linkRouter.post('/api/identity/:id/unlink', async (c) => {
  try {
    const identityId = c.req.param('id');
    const body = await c.req.json();
    const { chain_id, owner_signature, nonce, expires } = body;

    if (!chain_id || !owner_signature || !nonce || !expires) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    if (expires < Math.floor(Date.now() / 1000)) {
      return c.json({ error: 'Signature expired' }, 400);
    }

    const baseAddress = process.env.AGENT_WALLET;
    if (!baseAddress) {
      return c.json({ error: 'Server configuration error' }, 500);
    }

    const message = [
      'Janus unlink',
      `identity: ${identityId}`,
      `chain_id: ${chain_id}`,
      `nonce: ${nonce}`,
      `expires: ${expires}`,
    ].join('\n');

    const ownerSigner = ethers.verifyMessage(message, owner_signature);
    if (ownerSigner.toLowerCase() !== baseAddress.toLowerCase()) {
      return c.json({ error: 'Invalid owner signature' }, 400);
    }

    return c.json({
      status: 'verified',
      identity_id: identityId,
      chain_id,
      message: 'Signature verified. Submit to JanusRegistry.unlinkChain on-chain.',
    });
  } catch (err: any) {
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
});

export { linkRouter };
