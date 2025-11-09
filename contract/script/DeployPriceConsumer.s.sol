// contracts/script/DeployPriceConsumer.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Script, console} from "forge-std/Script.sol";
import {PriceConsumer} from "../src/PriceConsumer.sol";

contract DeployPriceConsumer is Script {
    function run() external {
        // Get the deployer's address
        address deployer = vm.envAddress("DEPLOYER_ADDRESS");
        require(deployer != address(0), "DEPLOYER_ADDRESS not set in .env file");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployer);
        
        // Deploy PriceConsumer
        PriceConsumer priceConsumer = new PriceConsumer();
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        // Log the deployed contract address
        console.log("PriceConsumer deployed at:", address(priceConsumer));
    }
}