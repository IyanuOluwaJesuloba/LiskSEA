// contracts/src/PriceConsumer.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@redstone-finance/evm-connector/contracts/data-services/PrimaryProdDataServiceConsumerBase.sol";

contract PriceConsumer is PrimaryProdDataServiceConsumerBase {
    // Returns the latest price of an asset in USD with 8 decimals
    function getLatestPrice(bytes32 dataFeedId) 
        public 
        view 
        returns (uint256) 
    {
        bytes32[] memory dataFeedIds = new bytes32[](1);
        dataFeedIds[0] = dataFeedId;
        
        uint256[] memory values = getOracleNumericValuesFromTxMsg(dataFeedIds);
        return values[0];
    }
    
    // Helper function to get price by symbol
    function getPriceBySymbol(string calldata symbol) 
        external 
        view 
        returns (uint256) 
    {
        return getLatestPrice(bytes32(abi.encodePacked(symbol)));
    }
}