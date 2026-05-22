#!/bin/bash
# ops/seed-activity.sh
# Seed initial on-chain activity for JanusRegistry
set -e

CONTRACT=${JANUS_REGISTRY_ADDR}
RPC=${BASE_MAINNET_RPC}
PK=${DEPLOYER_PK}

if [ -z "$CONTRACT" ] || [ -z "$RPC" ] || [ -z "$PK" ]; then
    echo "Error: JANUS_REGISTRY_ADDR, BASE_MAINNET_RPC, and DEPLOYER_PK must be set"
    exit 1
fi

echo "Seeding activity for JanusRegistry at $CONTRACT"

# Register a test identity
for i in $(seq 1 3); do
    IDENTITY_ID=$(cast keccak "test-identity-$i")
    BASE_ADDR=$(cast wallet address --private-key $PK)
    
    echo "Registering identity $i..."
    cast send $CONTRACT \
        "registerIdentity(bytes32,address,bytes32,bytes32)" \
        $IDENTITY_ID \
        $BASE_ADDR \
        $(cast to-bytes32 0) \
        $(cast to-bytes32 0) \
        --rpc-url $RPC \
        --private-key $PK
    
    sleep 10
done

echo "Seed activity complete!"
