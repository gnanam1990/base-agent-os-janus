// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {JanusRegistry} from "../src/JanusRegistry.sol";

contract JanusRegistryTest is Test {
    JanusRegistry public registry;

    address public owner;
    address public agentAddr;

    uint256 constant USER1_PK = 0xA11CE;
    uint256 constant USER2_PK = 0xB0B;
    uint256 constant POLY_PK = 0xC0DE;
    address public user1;
    address public user2;
    address public polyAddr;

    bytes32 public identityId1 = keccak256("identity-1");
    bytes32 public identityId2 = keccak256("identity-2");

    function setUp() public {
        owner = makeAddr("owner");
        agentAddr = makeAddr("agent");
        user1 = vm.addr(USER1_PK);
        user2 = vm.addr(USER2_PK);
        polyAddr = vm.addr(POLY_PK);

        vm.prank(owner);
        registry = new JanusRegistry(agentAddr);
    }

    // ─── Constructor Tests ──────────────────────────────────────────────
    function test_constructor_setsAgent() public view {
        assertEq(registry.agent(), agentAddr);
    }

    function test_constructor_setsOwner() public view {
        assertEq(registry.owner(), owner);
    }

    // ─── setAgent Tests ─────────────────────────────────────────────────
    function test_setAgent_byOwner_succeeds() public {
        address newAgent = makeAddr("newAgent");
        vm.prank(owner);
        registry.setAgent(newAgent);
        assertEq(registry.agent(), newAgent);
    }

    function test_setAgent_byNonOwner_reverts() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        registry.setAgent(user1);
    }

    // ─── registerIdentity Tests ─────────────────────────────────────────
    function test_registerIdentity_happyPath() public {
        vm.prank(agentAddr);
        registry.registerIdentity(identityId1, user1, bytes32(0), bytes32(0));

        JanusRegistry.Identity memory identity;
        (identity.identityId, identity.baseAddress, identity.basenameHash, identity.verifiedAt, identity.attestationUID, identity.linkedChainsBitmap) = registry.identities(identityId1);
        assertEq(identity.baseAddress, user1);
        assertEq(identity.identityId, identityId1);
        assertTrue(identity.verifiedAt > 0);
    }

    function test_registerIdentity_emitsEvent() public {
        vm.prank(agentAddr);
        vm.expectEmit(true, true, false, true);
        emit JanusRegistry.IdentityRegistered(identityId1, user1, bytes32(0), uint64(block.timestamp));
        registry.registerIdentity(identityId1, user1, bytes32(0), bytes32(0));
    }

    function test_registerIdentity_byNonAgent_reverts() public {
        vm.prank(user1);
        vm.expectRevert(JanusRegistry.NotAgent.selector);
        registry.registerIdentity(identityId1, user1, bytes32(0), bytes32(0));
    }

    function test_registerIdentity_duplicate_reverts() public {
        vm.prank(agentAddr);
        registry.registerIdentity(identityId1, user1, bytes32(0), bytes32(0));

        vm.prank(agentAddr);
        vm.expectRevert(JanusRegistry.IdentityExists.selector);
        registry.registerIdentity(identityId1, user2, bytes32(0), bytes32(0));
    }

    function test_registerIdentity_setsAddressMapping() public {
        vm.prank(agentAddr);
        registry.registerIdentity(identityId1, user1, bytes32(0), bytes32(0));

        assertEq(registry.addressToIdentity(user1), identityId1);
    }

    // ─── getProfile Tests ───────────────────────────────────────────────
    function test_getProfile_returnsCorrectData() public {
        vm.prank(agentAddr);
        registry.registerIdentity(identityId1, user1, bytes32(0), bytes32(0));

        (JanusRegistry.Identity memory identity, address[5] memory chainAddrs) = registry.getProfile(identityId1);

        assertEq(identity.baseAddress, user1);
        assertEq(chainAddrs[0], user1);
        assertEq(chainAddrs[1], address(0));
    }

    function test_getProfile_nonExistentIdentity() public {
        (JanusRegistry.Identity memory identity, address[5] memory chainAddrs) = registry.getProfile(identityId2);

        assertEq(identity.baseAddress, address(0));
        assertEq(chainAddrs[0], address(0));
    }

    // ─── linkChain Tests ────────────────────────────────────────────────
    function _signMessage(bytes32 identityId, uint16 chainBit, address addr, uint256 nonce, uint64 expires, uint256 signerPk)
        internal
        pure
        returns (bytes memory)
    {
        bytes32 msgHash = keccak256(abi.encodePacked(identityId, chainBit, addr, nonce, expires));
        bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", msgHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPk, ethSignedHash);
        return abi.encodePacked(r, s, v);
    }

    function test_linkChain_happyPath() public {
        vm.prank(agentAddr);
        registry.registerIdentity(identityId1, user1, bytes32(0), bytes32(0));

        uint256 nonce = 1;
        uint64 expires = uint64(block.timestamp + 3600);
        uint16 chainBit = 1;
        address addr = polyAddr;

        bytes memory baseSig = _signMessage(identityId1, chainBit, addr, nonce, expires, USER1_PK);
        bytes memory chainSig = _signMessage(identityId1, chainBit, addr, nonce, expires, POLY_PK);

        registry.linkChain(identityId1, chainBit, addr, baseSig, chainSig, nonce, expires);

        assertEq(registry.chainAddresses(identityId1, chainBit), addr);

        (JanusRegistry.Identity memory identity,) = registry.getProfile(identityId1);
        assertTrue(identity.linkedChainsBitmap & uint16(1 << chainBit) != 0);
    }

    function test_linkChain_emitsEvent() public {
        vm.prank(agentAddr);
        registry.registerIdentity(identityId1, user1, bytes32(0), bytes32(0));

        uint256 nonce = 1;
        uint64 expires = uint64(block.timestamp + 3600);
        uint16 chainBit = 1;
        address addr = polyAddr;

        bytes memory baseSig = _signMessage(identityId1, chainBit, addr, nonce, expires, USER1_PK);
        bytes memory chainSig = _signMessage(identityId1, chainBit, addr, nonce, expires, POLY_PK);

        vm.expectEmit(true, true, true, false);
        emit JanusRegistry.ChainLinked(identityId1, chainBit, addr);
        registry.linkChain(identityId1, chainBit, addr, baseSig, chainSig, nonce, expires);
    }

    function test_linkChain_unknownIdentity_reverts() public {
        uint256 nonce = 1;
        uint64 expires = uint64(block.timestamp + 3600);
        uint16 chainBit = 1;
        address addr = polyAddr;

        bytes memory baseSig = _signMessage(identityId1, chainBit, addr, nonce, expires, USER1_PK);
        bytes memory chainSig = _signMessage(identityId1, chainBit, addr, nonce, expires, POLY_PK);

        vm.expectRevert(JanusRegistry.IdentityUnknown.selector);
        registry.linkChain(identityId1, chainBit, addr, baseSig, chainSig, nonce, expires);
    }

    function test_linkChain_expiredSignature_reverts() public {
        vm.prank(agentAddr);
        registry.registerIdentity(identityId1, user1, bytes32(0), bytes32(0));

        uint256 nonce = 1;
        uint64 expires = uint64(block.timestamp - 1);
        uint16 chainBit = 1;
        address addr = polyAddr;

        bytes memory baseSig = _signMessage(identityId1, chainBit, addr, nonce, expires, USER1_PK);
        bytes memory chainSig = _signMessage(identityId1, chainBit, addr, nonce, expires, POLY_PK);

        vm.expectRevert(JanusRegistry.SignatureExpired.selector);
        registry.linkChain(identityId1, chainBit, addr, baseSig, chainSig, nonce, expires);
    }

    function test_linkChain_nonceReuse_reverts() public {
        vm.prank(agentAddr);
        registry.registerIdentity(identityId1, user1, bytes32(0), bytes32(0));

        _linkChainAndExpectNonceReuse();
    }

    function _linkChainAndExpectNonceReuse() internal {
        uint256 nonce = 1;
        uint64 expires = uint64(block.timestamp + 3600);

        // First link
        _doLink(1, 0xD001, nonce, expires);

        // Second link with same nonce should revert
        uint256 poly2Pk = 0xD002;
        address addr2 = vm.addr(poly2Pk);
        bytes memory baseSig2 = _signMessage(identityId1, 2, addr2, nonce, expires, USER1_PK);
        bytes memory chainSig2 = _signMessage(identityId1, 2, addr2, nonce, expires, poly2Pk);

        vm.expectRevert(JanusRegistry.NonceUsed.selector);
        registry.linkChain(identityId1, 2, addr2, baseSig2, chainSig2, nonce, expires);
    }

    function _doLink(uint16 chainBit, uint256 polyPk, uint256 nonce, uint64 expires) internal {
        address addr = vm.addr(polyPk);
        bytes memory baseSig = _signMessage(identityId1, chainBit, addr, nonce, expires, USER1_PK);
        bytes memory chainSig = _signMessage(identityId1, chainBit, addr, nonce, expires, polyPk);
        registry.linkChain(identityId1, chainBit, addr, baseSig, chainSig, nonce, expires);
    }

    function test_linkChain_invalidBaseSignature_reverts() public {
        vm.prank(agentAddr);
        registry.registerIdentity(identityId1, user1, bytes32(0), bytes32(0));

        uint256 nonce = 1;
        uint64 expires = uint64(block.timestamp + 3600);
        uint16 chainBit = 1;
        address addr = polyAddr;

        // Sign with wrong key (USER2_PK instead of USER1_PK)
        bytes memory baseSig = _signMessage(identityId1, chainBit, addr, nonce, expires, USER2_PK);
        bytes memory chainSig = _signMessage(identityId1, chainBit, addr, nonce, expires, POLY_PK);

        vm.expectRevert(JanusRegistry.InvalidSignature.selector);
        registry.linkChain(identityId1, chainBit, addr, baseSig, chainSig, nonce, expires);
    }

    function test_isNonceUsed() public {
        vm.prank(agentAddr);
        registry.registerIdentity(identityId1, user1, bytes32(0), bytes32(0));

        assertFalse(registry.isNonceUsed(identityId1, 1));

        uint256 nonce = 1;
        uint64 expires = uint64(block.timestamp + 3600);
        uint16 chainBit = 1;
        address addr = polyAddr;

        bytes memory baseSig = _signMessage(identityId1, chainBit, addr, nonce, expires, USER1_PK);
        bytes memory chainSig = _signMessage(identityId1, chainBit, addr, nonce, expires, POLY_PK);

        registry.linkChain(identityId1, chainBit, addr, baseSig, chainSig, nonce, expires);

        assertTrue(registry.isNonceUsed(identityId1, 1));
    }

    // ─── unlinkChain Tests ──────────────────────────────────────────────
    function test_unlinkChain_happyPath() public {
        vm.prank(agentAddr);
        registry.registerIdentity(identityId1, user1, bytes32(0), bytes32(0));

        uint256 nonce = 1;
        uint64 expires = uint64(block.timestamp + 3600);
        uint16 chainBit = 1;
        address addr = polyAddr;

        bytes memory baseSig = _signMessage(identityId1, chainBit, addr, nonce, expires, USER1_PK);
        bytes memory chainSig = _signMessage(identityId1, chainBit, addr, nonce, expires, POLY_PK);

        registry.linkChain(identityId1, chainBit, addr, baseSig, chainSig, nonce, expires);

        vm.prank(user1);
        registry.unlinkChain(identityId1, chainBit);

        assertEq(registry.chainAddresses(identityId1, chainBit), address(0));

        (JanusRegistry.Identity memory identity,) = registry.getProfile(identityId1);
        assertTrue(identity.linkedChainsBitmap & uint16(1 << chainBit) == 0);
    }

    function test_unlinkChain_emitsEvent() public {
        vm.prank(agentAddr);
        registry.registerIdentity(identityId1, user1, bytes32(0), bytes32(0));

        uint256 nonce = 1;
        uint64 expires = uint64(block.timestamp + 3600);
        uint16 chainBit = 1;
        address addr = polyAddr;

        bytes memory baseSig = _signMessage(identityId1, chainBit, addr, nonce, expires, USER1_PK);
        bytes memory chainSig = _signMessage(identityId1, chainBit, addr, nonce, expires, POLY_PK);

        registry.linkChain(identityId1, chainBit, addr, baseSig, chainSig, nonce, expires);

        vm.prank(user1);
        vm.expectEmit(true, true, false, false);
        emit JanusRegistry.ChainUnlinked(identityId1, chainBit);
        registry.unlinkChain(identityId1, chainBit);
    }

    function test_unlinkChain_notOwner_reverts() public {
        vm.prank(agentAddr);
        registry.registerIdentity(identityId1, user1, bytes32(0), bytes32(0));

        uint256 nonce = 1;
        uint64 expires = uint64(block.timestamp + 3600);
        uint16 chainBit = 1;
        address addr = polyAddr;

        bytes memory baseSig = _signMessage(identityId1, chainBit, addr, nonce, expires, USER1_PK);
        bytes memory chainSig = _signMessage(identityId1, chainBit, addr, nonce, expires, POLY_PK);

        registry.linkChain(identityId1, chainBit, addr, baseSig, chainSig, nonce, expires);

        vm.prank(user2);
        vm.expectRevert(JanusRegistry.NotIdentityOwner.selector);
        registry.unlinkChain(identityId1, chainBit);
    }

    function test_unlinkChain_notLinked_reverts() public {
        vm.prank(agentAddr);
        registry.registerIdentity(identityId1, user1, bytes32(0), bytes32(0));

        vm.prank(user1);
        vm.expectRevert(JanusRegistry.NotLinked.selector);
        registry.unlinkChain(identityId1, 1);
    }
}
