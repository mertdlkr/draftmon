// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/MonadManagerLeague.sol";

contract DeployMonadLeague is Script {
    function run() external {
        // Load private key from .env (make sure ADMIN_KEY is set and matches the var name used by the node script)
        // Note: In foundry, it's common to use PRIVATE_KEY. We'll read ADMIN_KEY to match our orchestrator.
        uint256 deployerPrivateKey = vm.envUint("ADMIN_KEY");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the contract with 0.1 ether entry fee
        MonadManagerLeague league = new MonadManagerLeague(0.1 ether);

        // Stop broadcasting
        vm.stopBroadcast();

        // Print the deployed address
        console.log("MonadManagerLeague deployed to:", address(league));
    }
}
