// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {LinkForgeAI} from "../src/LinkForgeAI.sol";

/**
 * @title DeployLinkForgeAI
 * @notice Deployment script for LinkForgeAI contract
 */
contract DeployLinkForgeAI is Script {
    // Base Sepolia Chainlink Configuration
    address constant FUNCTIONS_ROUTER_BASE_SEPOLIA = 0xf9B8fc078197181C841c296C876945aaa425B278;
    bytes32 constant DON_ID_BASE_SEPOLIA = 0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000;

    // Sepolia Chainlink Configuration (alternative)
    address constant FUNCTIONS_ROUTER_SEPOLIA = 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0;
    bytes32 constant DON_ID_SEPOLIA = 0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;

    function run() external returns (LinkForgeAI) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        uint64 subscriptionId = uint64(vm.envUint("CHAINLINK_SUBSCRIPTION_ID"));

        // Detect network
        string memory network = vm.envOr("NETWORK", string("base_sepolia"));

        address functionsRouter;
        bytes32 donId;

        if (keccak256(abi.encodePacked(network)) == keccak256(abi.encodePacked("sepolia"))) {
            functionsRouter = FUNCTIONS_ROUTER_SEPOLIA;
            donId = DON_ID_SEPOLIA;
            console.log("Deploying to Sepolia...");
        } else {
            functionsRouter = FUNCTIONS_ROUTER_BASE_SEPOLIA;
            donId = DON_ID_BASE_SEPOLIA;
            console.log("Deploying to Base Sepolia...");
        }

        vm.startBroadcast(deployerPrivateKey);

        LinkForgeAI linkForgeAI = new LinkForgeAI(
            functionsRouter,
            donId,
            subscriptionId
        );

        console.log("LinkForgeAI deployed to:", address(linkForgeAI));
        console.log("Functions Router:", functionsRouter);
        console.log("Subscription ID:", subscriptionId);

        // Add example price feeds (Base Sepolia)
        if (keccak256(abi.encodePacked(network)) == keccak256(abi.encodePacked("base_sepolia"))) {
            // ETH/USD on Base Sepolia
            linkForgeAI.addPriceFeed("ETH", 0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1);
            console.log("Added ETH/USD price feed");

            // BTC/USD on Base Sepolia
            linkForgeAI.addPriceFeed("BTC", 0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298);
            console.log("Added BTC/USD price feed");
        }

        vm.stopBroadcast();

        return linkForgeAI;
    }
}
