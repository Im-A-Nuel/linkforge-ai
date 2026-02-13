// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";

/**
 * @title LinkForgeAI
 * @notice AI-powered portfolio management with Chainlink integration
 * @dev Integrates Chainlink Functions, Data Feeds, and Automation
 */
contract LinkForgeAI is FunctionsClient, AutomationCompatibleInterface {
    using FunctionsRequest for FunctionsRequest.Request;

    // ============ State Variables ============

    // Chainlink Functions
    bytes32 public donId;
    uint64 public subscriptionId;
    uint32 public gasLimit;
    bytes32 public latestRequestId;

    // User Profiles
    struct UserProfile {
        RiskLevel riskLevel;
        bool esgPriority;
        bool automationEnabled;
        uint256 lastRebalance;
    }

    enum RiskLevel {
        LOW,
        MEDIUM,
        HIGH
    }

    enum RebalanceAction {
        HOLD,
        SHIFT_TO_STABLE,
        INCREASE_EXPOSURE,
        DIVERSIFY
    }

    // Reasoning Storage
    struct AIReasoning {
        int256 sentimentScore;
        uint256 volatilityScore;
        uint256 riskScore;
        uint256 esgScore;
        RebalanceAction recommendedAction;
        string ipfsHash; // Full reasoning stored on IPFS
        uint256 timestamp;
    }

    // State mappings
    mapping(address => UserProfile) public userProfiles;
    mapping(bytes32 => address) public requestToUser;
    mapping(address => AIReasoning) public latestReasoning;
    mapping(address => AIReasoning[]) public reasoningHistory;

    // Chainlink Data Feeds (example for Base Sepolia)
    mapping(string => AggregatorV3Interface) public priceFeeds;

    // Automation
    uint256 public automationInterval = 1 hours;
    mapping(address => uint256) public lastAutomationCheck;

    // ============ Events ============

    event ProfileUpdated(
        address indexed user,
        RiskLevel riskLevel,
        bool esgPriority,
        bool automationEnabled
    );

    event RebalanceRequested(
        address indexed user,
        bytes32 indexed requestId,
        uint256 timestamp
    );

    event ReasoningCommitted(
        address indexed user,
        int256 sentimentScore,
        uint256 volatilityScore,
        RebalanceAction recommendedAction,
        string ipfsHash,
        uint256 timestamp
    );

    event RebalanceExecuted(
        address indexed user,
        RebalanceAction action,
        uint256 timestamp
    );

    event PriceFeedAdded(string indexed asset, address feedAddress);

    // ============ Constructor ============

    constructor(
        address _functionsRouter,
        bytes32 _donId,
        uint64 _subscriptionId
    ) FunctionsClient(_functionsRouter) {
        donId = _donId;
        subscriptionId = _subscriptionId;
        gasLimit = 300000;
    }

    // ============ Profile Management ============

    /**
     * @notice Set user profile preferences
     * @param _riskLevel User's risk tolerance (0=LOW, 1=MEDIUM, 2=HIGH)
     * @param _esgPriority Enable ESG-focused investments
     * @param _automationEnabled Enable automated rebalancing
     */
    function setProfile(
        RiskLevel _riskLevel,
        bool _esgPriority,
        bool _automationEnabled
    ) external {
        UserProfile storage profile = userProfiles[msg.sender];
        profile.riskLevel = _riskLevel;
        profile.esgPriority = _esgPriority;
        profile.automationEnabled = _automationEnabled;

        emit ProfileUpdated(msg.sender, _riskLevel, _esgPriority, _automationEnabled);
    }

    /**
     * @notice Get user profile
     * @param user User address
     */
    function getProfile(address user) external view returns (UserProfile memory) {
        return userProfiles[user];
    }

    // ============ Chainlink Functions Integration ============

    /**
     * @notice Request AI analysis via Chainlink Functions
     * @param source JavaScript source code for off-chain computation
     * @param args Arguments for the function (e.g., user address, assets)
     */
    function requestAIAnalysis(
        string calldata source,
        string[] calldata args
    ) external returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);

        if (args.length > 0) {
            req.setArgs(args);
        }

        requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donId
        );

        requestToUser[requestId] = msg.sender;
        latestRequestId = requestId;

        emit RebalanceRequested(msg.sender, requestId, block.timestamp);

        return requestId;
    }

    /**
     * @notice Callback function for Chainlink Functions
     * @param requestId The request ID
     * @param response The response data
     * @param err Any error message
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        address user = requestToUser[requestId];

        if (err.length > 0) {
            // Handle error
            return;
        }

        // Decode response (format: sentimentScore, volatilityScore, riskScore, esgScore, action, ipfsHash)
        (
            int256 sentimentScore,
            uint256 volatilityScore,
            uint256 riskScore,
            uint256 esgScore,
            uint8 actionIndex,
            string memory ipfsHash
        ) = abi.decode(response, (int256, uint256, uint256, uint256, uint8, string));

        RebalanceAction action = RebalanceAction(actionIndex);

        // Store reasoning
        AIReasoning memory reasoning = AIReasoning({
            sentimentScore: sentimentScore,
            volatilityScore: volatilityScore,
            riskScore: riskScore,
            esgScore: esgScore,
            recommendedAction: action,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp
        });

        latestReasoning[user] = reasoning;
        reasoningHistory[user].push(reasoning);

        emit ReasoningCommitted(
            user,
            sentimentScore,
            volatilityScore,
            action,
            ipfsHash,
            block.timestamp
        );

        // Auto-execute if automation is enabled
        UserProfile memory profile = userProfiles[user];
        if (profile.automationEnabled) {
            _executeRebalance(user, action);
        }
    }

    // ============ Chainlink Data Feeds ============

    /**
     * @notice Add a price feed for an asset
     * @param asset Asset symbol (e.g., "BTC", "ETH")
     * @param feedAddress Chainlink price feed address
     */
    function addPriceFeed(string calldata asset, address feedAddress) external {
        priceFeeds[asset] = AggregatorV3Interface(feedAddress);
        emit PriceFeedAdded(asset, feedAddress);
    }

    /**
     * @notice Get latest price for an asset
     * @param asset Asset symbol
     * @return price Latest price
     * @return decimals Price decimals
     */
    function getLatestPrice(string calldata asset)
        external
        view
        returns (int256 price, uint8 decimals)
    {
        AggregatorV3Interface feed = priceFeeds[asset];
        require(address(feed) != address(0), "Price feed not found");

        (, int256 answer, , , ) = feed.latestRoundData();
        decimals = feed.decimals();

        return (answer, decimals);
    }

    // ============ Chainlink Automation ============

    /**
     * @notice Check if upkeep is needed (called by Chainlink Automation)
     * @param checkData Data passed to the function
     * @return upkeepNeeded Whether upkeep is needed
     * @return performData Data to pass to performUpkeep
     */
    function checkUpkeep(bytes calldata checkData)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        address user = abi.decode(checkData, (address));
        UserProfile memory profile = userProfiles[user];

        // Check if automation is enabled and interval has passed
        upkeepNeeded = profile.automationEnabled &&
                       (block.timestamp - lastAutomationCheck[user] >= automationInterval);

        performData = checkData;
    }

    /**
     * @notice Perform upkeep (called by Chainlink Automation)
     * @param performData Data from checkUpkeep
     */
    function performUpkeep(bytes calldata performData) external override {
        address user = abi.decode(performData, (address));

        lastAutomationCheck[user] = block.timestamp;

        // Trigger AI analysis request
        // In production, you would call requestAIAnalysis with proper source and args
    }

    // ============ Internal Functions ============

    /**
     * @notice Execute rebalance action
     * @param user User address
     * @param action Rebalance action to execute
     */
    function _executeRebalance(address user, RebalanceAction action) internal {
        UserProfile storage profile = userProfiles[user];
        profile.lastRebalance = block.timestamp;

        // In production, this would interact with DEX protocols
        // For now, just emit event

        emit RebalanceExecuted(user, action, block.timestamp);
    }

    // ============ View Functions ============

    /**
     * @notice Get reasoning history for a user
     * @param user User address
     * @return Array of AI reasoning records
     */
    function getReasoningHistory(address user)
        external
        view
        returns (AIReasoning[] memory)
    {
        return reasoningHistory[user];
    }

    /**
     * @notice Get latest reasoning for a user
     * @param user User address
     */
    function getLatestReasoning(address user)
        external
        view
        returns (AIReasoning memory)
    {
        return latestReasoning[user];
    }

    // ============ Admin Functions ============

    /**
     * @notice Update Chainlink Functions configuration
     */
    function updateFunctionsConfig(
        bytes32 _donId,
        uint64 _subscriptionId,
        uint32 _gasLimit
    ) external {
        donId = _donId;
        subscriptionId = _subscriptionId;
        gasLimit = _gasLimit;
    }

    /**
     * @notice Update automation interval
     */
    function updateAutomationInterval(uint256 _interval) external {
        automationInterval = _interval;
    }
}
