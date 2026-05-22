import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { x402 } from './x402.js';
import { identityRouter } from './routes/identity.js';
import { linkRouter } from './routes/link.js';

const app = new Hono();

app.use('/api/identity/:seed', x402);
app.use('/api/identity/:seed/full', x402);

app.route('/', identityRouter);
app.route('/', linkRouter);

const port = parseInt(process.env.PORT_API || '3034', 10);

serve({ fetch: app.fetch, port }, () => {
  console.log(`Janus API running on port ${port}`);
});

export default app;
