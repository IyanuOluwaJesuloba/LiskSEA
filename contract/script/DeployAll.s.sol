// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {LToken} from "../src/Token.sol";
import {LNFT} from "../src/NFT.sol";

contract DeployAll is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        LToken token = new LToken(1000000);
        console.log("LToken deployed to:", address(token));

        LNFT nft = new LNFT();
        console.log("LNFT deployed to:", address(nft));

        vm.stopBroadcast();
    }
}
