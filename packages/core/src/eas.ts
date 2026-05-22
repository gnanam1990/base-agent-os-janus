/** EAS deployment addresses on Base mainnet (chainId 8453). */
export const EAS_BASE_ADDRESS = '0x4200000000000000000000000000000000000021' as const;
export const EAS_SCHEMA_REGISTRY_BASE = '0x4200000000000000000000000000000000000020' as const;

/** Janus's primary EAS schema string. Register once via packages/eas-attest. */
export const PRIMARY_SCHEMA = 'address base_address,bytes32 identity_id,string basename,uint256 verified_at' as const;
