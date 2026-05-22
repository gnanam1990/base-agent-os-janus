// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title JanusRegistry
/// @notice On-chain identity registry for cross-chain identity resolution
/// @dev Stores identities, links, and chain addresses. Agent-only writes.
contract JanusRegistry is Ownable {
    // ─── Errors ──────────────────────────────────────────────────────────
    error NotAgent();
    error IdentityExists();
    error IdentityUnknown();
    error InvalidSignature();
    error SignatureExpired();
    error NonceUsed();
    error InvalidChainBit();
    error NotIdentityOwner();
    error AlreadyLinked();
    error NotLinked();

    // ─── Events ─────────────────────────────────────────────────────────
    event IdentityRegistered(
        bytes32 indexed identityId,
        address indexed baseAddress,
        bytes32 basenameHash,
        uint64 verifiedAt
    );
    event ChainLinked(
        bytes32 indexed identityId,
        uint16 indexed chainBit,
        address indexed chainAddress
    );
    event ChainUnlinked(bytes32 indexed identityId, uint16 indexed chainBit);

    // ─── Structs ────────────────────────────────────────────────────────
    struct Identity {
        bytes32 identityId;
        address baseAddress;
        bytes32 basenameHash;
        uint64 verifiedAt;
        bytes32 attestationUID;
        uint16 linkedChainsBitmap;
    }

    // ─── Storage ────────────────────────────────────────────────────────
    mapping(bytes32 => Identity) public identities;
    mapping(address => bytes32) public addressToIdentity;
    mapping(bytes32 => mapping(uint16 => address)) public chainAddresses;

    address public agent;

    // Nonce tracking: identityId => nonce => used
    mapping(bytes32 => mapping(uint256 => bool)) private _usedNonces;

    // ─── Modifiers ──────────────────────────────────────────────────────
    modifier onlyAgent() {
        if (msg.sender != agent) revert NotAgent();
        _;
    }

    modifier onlyIdentityOwner(bytes32 identityId) {
        if (identities[identityId].baseAddress != msg.sender) revert NotIdentityOwner();
        _;
    }

    // ─── Constructor ────────────────────────────────────────────────────
    /// @param initialAgent The address authorized to write identities
    constructor(address initialAgent) Ownable(msg.sender) {
        agent = initialAgent;
    }

    // ─── Admin ──────────────────────────────────────────────────────────
    /// @notice Update the agent address
    /// @param newAgent New agent address
    function setAgent(address newAgent) external onlyOwner {
        agent = newAgent;
    }

    // ─── Identity Registration ──────────────────────────────────────────
    /// @notice Register a new on-chain identity
    /// @param identityId Keccak256-derived unique ID
    /// @param baseAddress The Base chain address for this identity
    /// @param basenameHash Hash of the Basename (bytes32, 0 if none)
    /// @param attestationUID EAS attestation UID (bytes32, 0 if none)
    function registerIdentity(
        bytes32 identityId,
        address baseAddress,
        bytes32 basenameHash,
        bytes32 attestationUID
    ) external onlyAgent {
        if (identities[identityId].baseAddress != address(0)) revert IdentityExists();

        identities[identityId] = Identity({
            identityId: identityId,
            baseAddress: baseAddress,
            basenameHash: basenameHash,
            verifiedAt: uint64(block.timestamp),
            attestationUID: attestationUID,
            linkedChainsBitmap: 0
        });

        addressToIdentity[baseAddress] = identityId;

        emit IdentityRegistered(identityId, baseAddress, basenameHash, uint64(block.timestamp));
    }

    // ─── Chain Linking ──────────────────────────────────────────────────
    /// @notice Link a cross-chain address to an identity with signature verification
    /// @param identityId The identity to link
    /// @param chainBit Bit position for the chain (0=Base,1=Polygon,2=Ethereum,3=Optimism,4=Arbitrum)
    /// @param addr The address on the target chain
    /// @param baseSig Signature from the identity's baseAddress owner
    /// @param chainSig Signature from the owner of addr
    /// @param nonce Unique nonce to prevent replay
    /// @param expires Signature expiration timestamp
    function linkChain(
        bytes32 identityId,
        uint16 chainBit,
        address addr,
        bytes calldata baseSig,
        bytes calldata chainSig,
        uint256 nonce,
        uint64 expires
    ) external {
        if (chainBit > 4) revert InvalidChainBit();
        if (identities[identityId].baseAddress == address(0)) revert IdentityUnknown();
        if (block.timestamp > expires) revert SignatureExpired();
        if (_usedNonces[identityId][nonce]) revert NonceUsed();

        uint16 bitMask = uint16(1 << chainBit);
        if (identities[identityId].linkedChainsBitmap & bitMask != 0) revert AlreadyLinked();

        address baseAddress = identities[identityId].baseAddress;

        _verifySignature(baseAddress, identityId, chainBit, addr, nonce, expires, baseSig);
        _verifySignature(addr, identityId, chainBit, addr, nonce, expires, chainSig);

        _usedNonces[identityId][nonce] = true;
        chainAddresses[identityId][chainBit] = addr;
        identities[identityId].linkedChainsBitmap |= bitMask;

        emit ChainLinked(identityId, chainBit, addr);
    }

    // ─── Chain Unlinking ────────────────────────────────────────────────
    /// @notice Unlink a cross-chain address from an identity
    /// @param identityId The identity to unlink from
    /// @param chainBit Bit position for the chain
    function unlinkChain(
        bytes32 identityId,
        uint16 chainBit
    ) external onlyIdentityOwner(identityId) {
        if (chainBit > 4) revert InvalidChainBit();

        uint16 bitMask = uint16(1 << chainBit);
        if (identities[identityId].linkedChainsBitmap & bitMask == 0) revert NotLinked();

        delete chainAddresses[identityId][chainBit];
        identities[identityId].linkedChainsBitmap &= ~bitMask;

        emit ChainUnlinked(identityId, chainBit);
    }

    // ─── View Functions ─────────────────────────────────────────────────
    /// @notice Get full profile for an identity
    /// @param identityId The identity to query
    /// @return identity The Identity struct
    /// @return chainAddrs Array of 5 chain addresses (Base, Polygon, Ethereum, Optimism, Arbitrum)
    function getProfile(bytes32 identityId)
        external
        view
        returns (Identity memory identity, address[5] memory chainAddrs)
    {
        identity = identities[identityId];
        chainAddrs[0] = identity.baseAddress;
        chainAddrs[1] = chainAddresses[identityId][1];
        chainAddrs[2] = chainAddresses[identityId][2];
        chainAddrs[3] = chainAddresses[identityId][3];
        chainAddrs[4] = chainAddresses[identityId][4];
    }

    /// @notice Check if a nonce has been used for an identity
    /// @param identityId The identity to check
    /// @param nonce The nonce to check
    /// @return True if the nonce has been used
    function isNonceUsed(bytes32 identityId, uint256 nonce) external view returns (bool) {
        return _usedNonces[identityId][nonce];
    }

    // ─── Internal Helpers ───────────────────────────────────────────────
    function _verifySignature(
        address signer,
        bytes32 identityId,
        uint16 chainBit,
        address addr,
        uint256 nonce,
        uint64 expires,
        bytes calldata sig
    ) internal pure {
        bytes32 msgHash = keccak256(abi.encodePacked(identityId, chainBit, addr, nonce, expires));
        bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", msgHash));
        address recovered = ecrecover(ethSignedHash, uint8(sig[64]), bytes32(sig[0:32]), bytes32(sig[32:64]));
        if (recovered != signer) revert InvalidSignature();
    }
}
