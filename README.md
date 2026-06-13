# Janus

> A cross-chain identity bridge: resolves and links a single identity across Base, Ethereum, Polygon, Optimism, and Arbitrum, backed by an on-chain registry.

![license](https://img.shields.io/badge/license-MIT-blue)

## Overview

Janus is the "Janus" component of the Base Agent OS. It aggregates a user's identity
across multiple chains and off-chain reputation sources, anchors it to an on-chain
`JanusRegistry` contract on Base, and exposes the result through an HTTP API. An
identity is keyed by a deterministic `identity_id` (the keccak256 of the Base address)
and can have addresses on other chains linked to it via dual-signature verification.

The repository is a pnpm + Foundry monorepo: a Solidity registry contract, a TypeScript
resolver library that pulls from naming and reputation services, EAS attestation tooling,
and a Hono HTTP server.

## Features

- **On-chain identity registry** (`JanusRegistry.sol`): agent-gated identity registration,
  cross-chain address linking with replay-protected dual-signature verification, unlinking,
  and profile reads. Signatures bind `block.chainid` and the contract address to prevent
  cross-deployment replay.
- **Identity resolution library** (`resolver/`): resolves Basenames and ENS names,
  reverse-resolves addresses, and aggregates reputation/social data from Farcaster, Ethos,
  Talent Protocol, and GitHub into a single profile.
- **HTTP API** (`server/`): on-chain profile lookups, cross-chain link/unlink endpoints
  with off-chain signature verification, plus `/health` and `/openapi.json`.
- **EAS attestation tooling** (`packages/eas-attest/`): schema registration script and
  helpers for Ethereum Attestation Service.
- **Shared core** (`packages/core/`): the registry ABI, link-message construction, EAS
  helpers, and shared types.

See [Status](#status) for what is wired up versus stubbed.

## Tech stack

- **Contracts:** Solidity `^0.8.24`, Foundry, OpenZeppelin (`Ownable`, `ECDSA`,
  `MessageHashUtils`).
- **Server / libraries:** TypeScript, Hono, viem, ethers, Zod, EAS SDK.
- **Tooling:** pnpm workspaces (`pnpm@9`), Node 20.

## Architecture

| Path | Purpose |
|------|---------|
| `contracts/` | Foundry project. `JanusRegistry.sol` is the on-chain identity registry; `script/Deploy.s.sol` deploys it. |
| `packages/core/` | Shared TypeScript: registry ABI, link-message builder, EAS helpers, types. |
| `packages/eas-attest/` | EAS schema registration and attestation helpers. |
| `resolver/` | Identity aggregation library; per-source clients live under `resolver/src/sources/`. |
| `server/` | Hono HTTP API exposing identity, link, and on-chain endpoints. |
| `ops/` | Deployment metadata (`deployments.json`) and operational scripts. |
| `docs/` | Linking flow documentation. |

## Getting started

### Prerequisites

- Node.js 20
- pnpm 9
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (for the contracts)
- Git submodules for OpenZeppelin (`contracts/lib/openzeppelin-contracts`)

### Installation

```bash
# Clone with submodules (OpenZeppelin lives in a submodule)
git clone --recurse-submodules <repo-url>
cd base-agent-os-janus

pnpm install
```

If you already cloned without submodules:

```bash
git submodule update --init --recursive
```

### Configuration

Copy `.env.example` and fill in the values you need. The variables the project reads:

| Variable | Used by | Purpose |
|----------|---------|---------|
| `BASE_MAINNET_RPC` | server, contracts | Base mainnet RPC endpoint |
| `BASESCAN_API_KEY` | contracts | Contract verification on BaseScan |
| `DEPLOYER_PK` | deploy script | Deployer private key |
| `AGENT_PK` | agent operations | Agent private key |
| `AGENT_WALLET` | server, deploy script | Agent/payee address; signature checks and registry agent |
| `JANUS_REGISTRY_ADDR` | server | Deployed `JanusRegistry` address |
| `REDIS_URL` | server (planned) | Redis connection string |
| `PORT_API` | server | API port (defaults to `3034`) |
| `POLYGON_RPC` | resolver | Polygon RPC endpoint |
| `ETH_MAINNET_RPC` | resolver | Ethereum mainnet RPC endpoint |
| `OPTIMISM_RPC` | resolver | Optimism RPC endpoint |
| `ARBITRUM_RPC` | resolver | Arbitrum RPC endpoint |
| `EAS_SCHEMA_UID_IDENTITY` | eas-attest | EAS schema UID for identity attestations |
| `EAS_SCHEMA_UID_LINK` | eas-attest | EAS schema UID for link attestations |
| `NEYNAR_API_KEY` | resolver (Farcaster) | Farcaster lookups |
| `ETHOS_API_KEY` | resolver (Ethos) | Ethos reputation lookups |
| `TALENT_API_KEY` | resolver (Talent) | Talent Protocol lookups |
| `GITHUB_TOKEN` | resolver (GitHub) | GitHub profile lookups |

Never commit real secret values.

### Running

```bash
# Build all packages
pnpm build

# Type-check / lint across the workspace
pnpm typecheck
pnpm lint

# Run the API server in watch mode (from the server package)
pnpm --filter @janus/server dev

# Or start the built server
pnpm --filter @janus/server start
```

Contracts (run inside `contracts/`):

```bash
cd contracts
forge build
forge test -vvv
forge script script/Deploy.s.sol --rpc-url base --broadcast
```

## Usage

### API endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/identity/:seed` | Resolve identity by seed (basename, ENS, or address) |
| `GET /api/identity/:seed/full` | Full identity aggregation across sources |
| `GET /api/identity/:id/onchain` | On-chain profile lookup from `JanusRegistry` |
| `POST /api/identity/:id/link` | Verify cross-chain link signatures (base + chain) |
| `POST /api/identity/:id/unlink` | Verify an unlink signature |
| `GET /health` | Health check |
| `GET /openapi.json` | OpenAPI description of the identity routes |

The `:seed` endpoints are intended to be metered (a payment middleware fronts them — see
Status). The `link`/`unlink` endpoints verify EIP-191 signatures off-chain and return a
`verified` status; the on-chain write to `JanusRegistry.linkChain` / `unlinkChain` is a
separate step performed by the caller.

### Resolver library

```ts
import { aggregateProfile } from '@janus/resolver';

const profile = await aggregateProfile({ basename: 'example.base.eth' });
// -> { identity_id, base_address, basename, farcaster_fid, ethos_score, ... }
```

## Testing

Contract tests run with Foundry:

```bash
cd contracts
forge test -vvv
forge coverage --report summary
```

`contracts/test/JanusRegistry.t.sol` covers registration, linking, unlinking, signature
verification, replay protection, and access control. The CI workflow
(`.github/workflows/ci.yml`) runs `pnpm build` + `pnpm typecheck` and the Foundry suite.
There are currently no TypeScript unit tests (`pnpm test` is a passthrough that finds no
per-package test scripts).

## Project structure

```
contracts/        Foundry project — JanusRegistry.sol + deploy script + tests
packages/
  core/           ABI, link-message builder, EAS helpers, shared types
  eas-attest/     EAS schema registration + attestation helpers
resolver/         Identity aggregation library (Basenames, ENS, Farcaster, Ethos, Talent, GitHub)
server/           Hono HTTP API (identity, link, x402 middleware)
ops/              deployments.json + operational scripts
docs/             LINKING.md
```

## Status

Early stage / preview. Honest state of the moving parts:

- **`JanusRegistry` contract — implemented and tested, not yet deployed.** `ops/deployments.json`
  contains `0xPLACEHOLDER` values; there is no live mainnet deployment. The Solidity is
  complete with full unit-test coverage.
- **Payment middleware — no-op stub, not production-ready.** `server/src/x402.ts` returns a
  402 with payment-required metadata when no `X-Payment` header is present, but when a header
  *is* present it calls `next()` without verifying or settling any payment. Pricing is metadata
  only and is not enforced.
- **Identity resolution endpoints — placeholder responses.** `GET /api/identity/:seed` and
  `:seed/full` currently return hardcoded zero-address placeholders; they do not yet call the
  resolver's `aggregateProfile`. The resolver library itself is implemented but not wired into
  these routes.
- **On-chain lookup — functional** once `JANUS_REGISTRY_ADDR` and `BASE_MAINNET_RPC` point at a
  deployed registry.
- **Link / unlink endpoints — functional off-chain signature verification.** They validate
  signatures and return `verified`; they do not broadcast the on-chain transaction.

## License

MIT. See [LICENSE](LICENSE).
