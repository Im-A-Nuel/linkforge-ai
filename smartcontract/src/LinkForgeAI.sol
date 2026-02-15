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

    address public owner;

    // Chainlink Functions
    bytes32 public donId;
    uint64 public subscriptionId;
    uint32 public gasLimit;
    bytes32 public latestRequestId;
    bytes32 public allowedSourceHash;
    uint256 public requestCooldown = 30 seconds;
    uint256 public maxSourceLength = 4096;
    uint256 public maxArgsLength = 8;
    uint256 private constant MAX_ACTION_INDEX = 3;

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
    mapping(address => bool) public hasProfile;
    mapping(bytes32 => address) public requestToUser;
    mapping(address => uint256) public lastRequestTimestamp;
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
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event FunctionsConfigUpdated(bytes32 donId, uint64 subscriptionId, uint32 gasLimit);
    event RequestLimitsUpdated(uint256 requestCooldown, uint256 maxSourceLength, uint256 maxArgsLength);
    event AllowedSourceHashUpdated(bytes32 indexed allowedSourceHash);
    event AutomationIntervalUpdated(uint256 automationInterval);
    event AnalysisRequestFailed(address indexed user, bytes32 indexed requestId, bytes err);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // ============ Constructor ============

    constructor(
        address _functionsRouter,
        bytes32 _donId,
        uint64 _subscriptionId
    ) FunctionsClient(_functionsRouter) {
        owner = msg.sender;
        donId = _donId;
        subscriptionId = _subscriptionId;
        gasLimit = 300000;

        emit OwnershipTransferred(address(0), msg.sender);
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
        hasProfile[msg.sender] = true;

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
        require(hasProfile[msg.sender], "Profile not set");
        require(bytes(source).length > 0, "Empty source");
        require(bytes(source).length <= maxSourceLength, "Source too large");
        require(args.length <= maxArgsLength, "Too many args");
        require(block.timestamp >= lastRequestTimestamp[msg.sender] + requestCooldown, "Request cooldown active");

        if (allowedSourceHash != bytes32(0)) {
            require(keccak256(bytes(source)) == allowedSourceHash, "Source not allowed");
        }

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
        lastRequestTimestamp[msg.sender] = block.timestamp;
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
        if (user == address(0)) {
            return;
        }

        if (err.length > 0) {
            emit AnalysisRequestFailed(user, requestId, err);
            delete requestToUser[requestId];
            return;
        }

        // Decode response (format: sentimentScore, volatilityScore, riskScore, esgScore, action, ipfsHash)
        (
            int256 sentimentScore,
            uint256 volatilityScore,
            uint256 riskScore,
            uint256 esgScore,
            uint256 actionIndex,
            string memory ipfsHash
        ) = abi.decode(response, (int256, uint256, uint256, uint256, uint256, string));

        if (actionIndex > MAX_ACTION_INDEX) {
            actionIndex = 0;
        }

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
        delete requestToUser[requestId];

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
    function addPriceFeed(string calldata asset, address feedAddress) external onlyOwner {
        require(bytes(asset).length > 0, "Empty asset");
        require(feedAddress != address(0), "Invalid feed");
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
        UserProfile memory profile = userProfiles[user];
        require(profile.automationEnabled, "Automation disabled");
        require(
            block.timestamp - lastAutomationCheck[user] >= automationInterval,
            "Automation interval not reached"
        );

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
    ) external onlyOwner {
        require(_gasLimit > 0, "Invalid gas limit");
        donId = _donId;
        subscriptionId = _subscriptionId;
        gasLimit = _gasLimit;

        emit FunctionsConfigUpdated(_donId, _subscriptionId, _gasLimit);
    }

    /**
     * @notice Set optional source code hash restriction for requests.
     * @dev Set to bytes32(0) to disable source hash validation.
     */
    function setAllowedSourceHash(bytes32 _allowedSourceHash) external onlyOwner {
        allowedSourceHash = _allowedSourceHash;
        emit AllowedSourceHashUpdated(_allowedSourceHash);
    }

    /**
     * @notice Set anti-abuse request limits.
     */
    function updateRequestLimits(
        uint256 _requestCooldown,
        uint256 _maxSourceLength,
        uint256 _maxArgsLength
    ) external onlyOwner {
        require(_maxSourceLength > 0, "Invalid source limit");
        require(_maxArgsLength > 0, "Invalid args limit");

        requestCooldown = _requestCooldown;
        maxSourceLength = _maxSourceLength;
        maxArgsLength = _maxArgsLength;

        emit RequestLimitsUpdated(_requestCooldown, _maxSourceLength, _maxArgsLength);
    }

    /**
     * @notice Update automation interval
     */
    function updateAutomationInterval(uint256 _interval) external onlyOwner {
        require(_interval > 0, "Invalid interval");
        automationInterval = _interval;
        emit AutomationIntervalUpdated(_interval);
    }

    /**
     * @notice Transfer contract ownership.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
