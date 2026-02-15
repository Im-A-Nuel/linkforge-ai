// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {LinkForgeAI} from "../src/LinkForgeAI.sol";

interface IFunctionsSubscriptionsRouter {
    function addConsumer(uint64 subscriptionId, address consumer) external;
}

/**
 * @title ConfigureLinkForgeAI
 * @notice Post-deployment configuration for LinkForgeAI.
 */
contract ConfigureLinkForgeAI is Script {
    address constant FUNCTIONS_ROUTER_BASE_SEPOLIA = 0xf9B8fc078197181C841c296C876945aaa425B278;
    bytes32 constant DON_ID_BASE_SEPOLIA = 0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000;

    bytes32 constant ALLOWED_SOURCE_HASH =
        0x1fe366a2679b2ff636ae8034a1a8595aa42d78dc01958c15fd0594988e50c795;

    function run(address linkForgeAddress) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        uint64 subscriptionId = uint64(vm.envUint("CHAINLINK_SUBSCRIPTION_ID"));

        vm.startBroadcast(deployerPrivateKey);

        LinkForgeAI linkForge = LinkForgeAI(linkForgeAddress);

        // Register consumer to subscription on Functions Router.
        try
            IFunctionsSubscriptionsRouter(FUNCTIONS_ROUTER_BASE_SEPOLIA).addConsumer(
                subscriptionId,
                linkForgeAddress
            )
        {
            console.log("Consumer added to subscription.");
        } catch {
            console.log("Consumer add skipped (already added or no permission).");
        }

        // Lock allowed source hash to frontend source.
        linkForge.setAllowedSourceHash(ALLOWED_SOURCE_HASH);
        console.log("Allowed source hash configured.");

        // Keep defaults explicit for operator clarity.
        linkForge.updateRequestLimits(30 seconds, 4096, 8);
        console.log("Request limits configured.");

        // Keep DON/subscription/gas in sync.
        linkForge.updateFunctionsConfig(DON_ID_BASE_SEPOLIA, subscriptionId, 300000);
        console.log("Functions config configured.");

        // Ensure feeds are present.
        linkForge.addPriceFeed("ETH", 0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1);
        linkForge.addPriceFeed("BTC", 0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298);
        console.log("Price feeds configured.");

        vm.stopBroadcast();
    }
}
