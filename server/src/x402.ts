import { Context, Next } from 'hono';

const wallet = process.env.AGENT_WALLET || '0x0';

const ROUTE_PRICES: Record<string, string> = {
  '/api/identity/:seed': '$0.10',
  '/api/identity/:seed/full': '$1.00',
};

export async function x402(c: Context, next: Next) {
  const paymentHeader = c.req.header('X-Payment');

  if (!paymentHeader) {
    return c.json(
      {
        x402Version: 1,
        paymentRequired: {
          maxAmountRequired: '100000',
          resource: c.req.url,
          description: 'Janus Identity Lookup',
          scheme: 'exact',
          network: 'base',
          payToAddress: wallet,
          maxTimeoutSeconds: 60,
        },
      },
      402
    );
  }

  await next();
}
