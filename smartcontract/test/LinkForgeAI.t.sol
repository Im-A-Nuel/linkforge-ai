// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {LinkForgeAI} from "../src/LinkForgeAI.sol";

contract LinkForgeAITest is Test {
    LinkForgeAI internal linkForge;
    address internal constant USER = address(0xBEEF);

    function setUp() public {
        linkForge = new LinkForgeAI(
            address(0x0000000000000000000000000000000000000001),
            bytes32("base-sepolia-don"),
            1
        );
    }

    function test_OwnerInitialized() public {
        assertEq(linkForge.owner(), address(this));
    }

    function test_RevertUpdateFunctionsConfigWhenNotOwner() public {
        vm.prank(USER);
        vm.expectRevert("Only owner");
        linkForge.updateFunctionsConfig(bytes32("other-don"), 2, 250000);
    }

    function test_RevertAddPriceFeedWhenNotOwner() public {
        vm.prank(USER);
        vm.expectRevert("Only owner");
        linkForge.addPriceFeed("ETH", address(0x1234));
    }

    function test_SetProfileMarksProfileConfigured() public {
        vm.prank(USER);
        linkForge.setProfile(LinkForgeAI.RiskLevel.MEDIUM, true, false);

        assertTrue(linkForge.hasProfile(USER));
    }

    function test_RevertRequestWhenProfileNotSet() public {
        string[] memory args = new string[](0);
        vm.prank(USER);
        vm.expectRevert("Profile not set");
        linkForge.requestAIAnalysis("return new Uint8Array();", args);
    }

    function test_RevertRequestWhenSourceHashNotAllowed() public {
        vm.prank(USER);
        linkForge.setProfile(LinkForgeAI.RiskLevel.LOW, false, false);

        linkForge.setAllowedSourceHash(keccak256(bytes("expected-source")));
        vm.warp(block.timestamp + linkForge.requestCooldown());

        string[] memory args = new string[](0);
        vm.prank(USER);
        vm.expectRevert("Source not allowed");
        linkForge.requestAIAnalysis("unexpected-source", args);
    }

    function test_TransferOwnership() public {
        address newOwner = address(0xCAFE);
        linkForge.transferOwnership(newOwner);

        assertEq(linkForge.owner(), newOwner);
    }
}
