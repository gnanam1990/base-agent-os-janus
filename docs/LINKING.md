# Janus Cross-Chain Linking Protocol

## Overview

Janus enables cross-chain identity linking by verifying that the same entity controls addresses on multiple chains. Both the Base address owner and the target chain address must sign a message proving ownership.

## Message Format

Both signers sign the exact same message:

```
Janus link
identity: <bytes32 hex>
base_address: <0x...>
chain_id: <numeric chain id>
chain_address: <0x...>
nonce: <uint256>
expires: <unix timestamp>
```

## Chain IDs

| Chain    | Bit Position | Numeric ID |
|----------|--------------|------------|
| Base     | 0            | 8453       |
| Polygon  | 1            | 137        |
| Ethereum | 2            | 1          |
| Optimism | 3            | 10         |
| Arbitrum | 4            | 42161      |

## Signing Process

1. **Generate nonce**: Random uint256, unique per identity
2. **Set expiration**: Unix timestamp (recommend 1 hour from now)
3. **Sign with Base owner**: EIP-191 personal_sign of the message
4. **Sign with chain owner**: EIP-191 personal_sign of the same message
5. **Submit**: Both signatures + parameters to `POST /api/identity/:id/link`

## Verification

The smart contract verifies:
- Both signatures are valid ECDSA recoveries
- Base signer matches the identity's registered base_address
- Chain signer matches the claimed chain_address
- Nonce hasn't been used before
- Signatures haven't expired

## Security Considerations

- Nonces prevent replay attacks
- Expiration prevents stale signatures
- Both signatures required prevents unilateral linking
- On-chain verification is trustless
