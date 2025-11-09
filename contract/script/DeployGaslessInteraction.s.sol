// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Script.sol";
import "../src/GaslessInteraction.sol";

contract DeployGaslessInteraction is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        GaslessInteraction gaslessInteraction = new GaslessInteraction();
        
        console.log("GaslessInteraction deployed to:", address(gaslessInteraction));
        
        vm.stopBroadcast();
    }
}
