// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {LNFT} from "../src/NFT.sol";

contract DeployNFT is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        LNFT nft = new LNFT();

        console.log("LNFT deployed to:", address(nft));
        console.log("NFT Name:", nft.name());
        console.log("NFT Symbol:", nft.symbol());

        vm.stopBroadcast();
    }
}
