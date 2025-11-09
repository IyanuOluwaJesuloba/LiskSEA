// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@redstone-finance/evm-connector/contracts/data-services/PrimaryProdDataServiceConsumerBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GaslessInteraction
 * @dev Demonstrates gasless transactions with RedStone oracle integration
 * Users can interact with price data without paying gas fees through Account Abstraction
 */
contract GaslessInteraction is PrimaryProdDataServiceConsumerBase, Ownable, ReentrancyGuard {
    
    // Events
    event PriceQueried(address indexed user, bytes32 indexed dataFeedId, uint256 price, uint256 timestamp);
    event PriceAlertSet(address indexed user, bytes32 indexed dataFeedId, uint256 targetPrice, bool isAbove);
    event ActionExecuted(address indexed user, string actionType, uint256 timestamp);
    
    // Structs
    struct PriceAlert {
        bytes32 dataFeedId;
        uint256 targetPrice;
        bool isAbove; // true for alert when price goes above, false for below
        bool isActive;
        uint256 createdAt;
    }
    
    struct UserAction {
        string actionType;
        uint256 timestamp;
        bytes32 dataFeedId;
        uint256 priceAtAction;
    }
    
    // State variables
    mapping(address => PriceAlert[]) public userAlerts;
    mapping(address => UserAction[]) public userActions;
    mapping(address => uint256) public userInteractionCount;
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Get latest price for a data feed (gasless-friendly)
     * @param dataFeedId The identifier for the price feed (e.g., bytes32("ETH"))
     */
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
    
    /**
     * @dev Get price by symbol string
     * @param symbol The symbol of the asset (e.g., "ETH", "BTC")
     */
    function getPriceBySymbol(string calldata symbol) 
        external 
        view 
        returns (uint256) 
    {
        return getLatestPrice(bytes32(abi.encodePacked(symbol)));
    }
    
    /**
     * @dev Get multiple prices at once (gas efficient)
     * @param dataFeedIds Array of data feed identifiers
     */
    function getMultiplePrices(bytes32[] calldata dataFeedIds)
        external
        view
        returns (uint256[] memory)
    {
        return getOracleNumericValuesFromTxMsg(dataFeedIds);
    }
    
    /**
     * @dev Record a price query (gasless transaction)
     * This function can be sponsored by a paymaster
     */
    function recordPriceQuery(bytes32 dataFeedId) 
        external 
        nonReentrant 
    {
        uint256 price = getLatestPrice(dataFeedId);
        
        userActions[msg.sender].push(UserAction({
            actionType: "PRICE_QUERY",
            timestamp: block.timestamp,
            dataFeedId: dataFeedId,
            priceAtAction: price
        }));
        
        userInteractionCount[msg.sender]++;
        
        emit PriceQueried(msg.sender, dataFeedId, price, block.timestamp);
        emit ActionExecuted(msg.sender, "PRICE_QUERY", block.timestamp);
    }
    
    /**
     * @dev Set a price alert (gasless transaction)
     * @param dataFeedId The data feed to monitor
     * @param targetPrice The target price for the alert
     * @param isAbove True if alert when price goes above target, false for below
     */
    function setPriceAlert(
        bytes32 dataFeedId,
        uint256 targetPrice,
        bool isAbove
    ) 
        external 
        nonReentrant 
    {
        userAlerts[msg.sender].push(PriceAlert({
            dataFeedId: dataFeedId,
            targetPrice: targetPrice,
            isAbove: isAbove,
            isActive: true,
            createdAt: block.timestamp
        }));
        
        userActions[msg.sender].push(UserAction({
            actionType: "SET_ALERT",
            timestamp: block.timestamp,
            dataFeedId: dataFeedId,
            priceAtAction: getLatestPrice(dataFeedId)
        }));
        
        userInteractionCount[msg.sender]++;
        
        emit PriceAlertSet(msg.sender, dataFeedId, targetPrice, isAbove);
        emit ActionExecuted(msg.sender, "SET_ALERT", block.timestamp);
    }
    
    /**
     * @dev Execute a demo action based on price condition (gasless)
     * @param dataFeedId The data feed to check
     * @param thresholdPrice The price threshold
     */
    function executePriceBasedAction(
        bytes32 dataFeedId,
        uint256 thresholdPrice
    ) 
        external 
        nonReentrant 
    {
        uint256 currentPrice = getLatestPrice(dataFeedId);
        
        require(currentPrice > 0, "Invalid price data");
        
        string memory actionType;
        if (currentPrice > thresholdPrice) {
            actionType = "PRICE_ABOVE_THRESHOLD";
        } else {
            actionType = "PRICE_BELOW_THRESHOLD";
        }
        
        userActions[msg.sender].push(UserAction({
            actionType: actionType,
            timestamp: block.timestamp,
            dataFeedId: dataFeedId,
            priceAtAction: currentPrice
        }));
        
        userInteractionCount[msg.sender]++;
        
        emit ActionExecuted(msg.sender, actionType, block.timestamp);
    }
    
    /**
     * @dev Get user's alerts
     */
    function getUserAlerts(address user) 
        external 
        view 
        returns (PriceAlert[] memory) 
    {
        return userAlerts[user];
    }
    
    /**
     * @dev Get user's action history
     */
    function getUserActions(address user) 
        external 
        view 
        returns (UserAction[] memory) 
    {
        return userActions[user];
    }
    
    /**
     * @dev Get user's interaction count
     */
    function getUserInteractionCount(address user) 
        external 
        view 
        returns (uint256) 
    {
        return userInteractionCount[user];
    }
    
    /**
     * @dev Batch execute multiple price queries (gas efficient)
     */
    function batchRecordPrices(bytes32[] calldata dataFeedIds) 
        external 
        nonReentrant 
    {
        uint256[] memory prices = getOracleNumericValuesFromTxMsg(dataFeedIds);
        
        for (uint256 i = 0; i < dataFeedIds.length; i++) {
            userActions[msg.sender].push(UserAction({
                actionType: "BATCH_PRICE_QUERY",
                timestamp: block.timestamp,
                dataFeedId: dataFeedIds[i],
                priceAtAction: prices[i]
            }));
            
            emit PriceQueried(msg.sender, dataFeedIds[i], prices[i], block.timestamp);
        }
        
        userInteractionCount[msg.sender] += dataFeedIds.length;
        emit ActionExecuted(msg.sender, "BATCH_QUERY", block.timestamp);
    }
    
    /**
     * @dev Cancel a price alert
     */
    function cancelAlert(uint256 alertIndex) 
        external 
    {
        require(alertIndex < userAlerts[msg.sender].length, "Invalid alert index");
        userAlerts[msg.sender][alertIndex].isActive = false;
        
        emit ActionExecuted(msg.sender, "CANCEL_ALERT", block.timestamp);
    }
}
