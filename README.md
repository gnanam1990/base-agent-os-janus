# Janus

> Cross-chain identity bridge agent. Part of the Base Agent OS.

![status](https://img.shields.io/badge/status-building-yellow)
![license](https://img.shields.io/badge/license-MIT-blue)

## Endpoints

| Endpoint | Price | Description |
|----------|-------|-------------|
| `GET /api/identity/:seed` | $0.10 | Resolve identity by basename, ENS, or address |
| `GET /api/identity/:seed/full` | $1.00 | Full identity aggregation with all sources |
| `GET /api/identity/:id/onchain` | Free | On-chain identity lookup from JanusRegistry |
| `POST /api/identity/:id/link` | Free | Submit cross-chain link signatures |
| `POST /api/identity/:id/unlink` | Free | Submit unlink request |
| `GET /health` | Free | Health check |
| `GET /openapi.json` | Free | OpenAPI specification |

## On-chain

- **JanusRegistry** - Deploy pending (see `ops/deployments.json` after mainnet deploy)

## Part of the Base Agent OS

This agent is one of ten in the Base Agents portfolio:

- [Cassandra](https://github.com/gnanam1990/cassandra) - Polymarket->Base alpha pipeline
- [Hephaestus](https://github.com/gnanam1990/hephaestus) - Autonomous contract forge
- [Kratos](https://github.com/gnanam1990/kratos) - Adversarial stress-tester
- [Argus](https://github.com/gnanam1990/argus) - Onchain sentinel
- [Veritas](https://github.com/gnanam1990/veritas) - Farcaster fact-checker
- [Janus](https://github.com/gnanam1990/janus) - Cross-chain identity bridge
- [Oracle](https://github.com/gnanam1990/oracle) - Prediction-market-as-a-service
- [Surya](https://github.com/gnanam1990/surya) - Yield strategist
- [Mercurius](https://github.com/gnanam1990/mercurius) - Agent-to-agent broker
- [Ananta](https://github.com/gnanam1990/ananta) - Indian market localization

## License

MIT (c) 2026 Gnanam (kRATOS)
