// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/TournamentPool.sol";

contract DeployTournamentPool is Script {
    function run() external {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        TournamentPool pool = new TournamentPool();
        console.log("TournamentPool deployed:", address(pool));
        vm.stopBroadcast();
    }
}
