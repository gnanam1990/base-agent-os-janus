// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {JanusRegistry} from "../src/JanusRegistry.sol";

contract Deploy is Script {
    function run() external returns (JanusRegistry reg) {
        uint256 pk = vm.envUint("DEPLOYER_PK");
        address agent = vm.envAddress("AGENT_WALLET");
        console.log("Deploying JanusRegistry");
        console.log("  Deployer:", vm.addr(pk));
        console.log("  Agent:", agent);
        vm.startBroadcast(pk);
        reg = new JanusRegistry(agent);
        vm.stopBroadcast();
        console.log("Deployed at:", address(reg));
    }
}
