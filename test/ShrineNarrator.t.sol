// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/ShrineNarrator.sol";

contract MockScheduler {
    uint256 public nextId = 1;
    uint256 public lastCallId;
    bytes public lastData;

    function schedule(bytes calldata data, uint64, uint32, uint8, uint8, uint8, uint256, uint256, uint256, address) external returns (uint256) {
        lastData = data;
        lastCallId = nextId;
        nextId++;
        return lastCallId;
    }
}

contract ShrineNarratorTest is Test {
    ShrineNarrator narrator;
    MockScheduler scheduler;
    address constant ASYNC_DELIVERY = 0x5A16214fF555848411544b005f7Ac063742f39F6;

    event NarrationPublished(bytes32 indexed jobId, string resultText, uint256 timestamp);

    function setUp() public {
        scheduler = new MockScheduler();
        narrator = new ShrineNarrator(address(scheduler), ASYNC_DELIVERY);
    }

    function testSchedulerIntegration() public {
        narrator.approveScheduler(address(scheduler));
        narrator.start();
        assertTrue(narrator.isRunning());
        assertGt(narrator.narrateId(), 0);
    }

    function testNarratorWakeup() public {
        narrator.approveScheduler(address(scheduler));
        narrator.start();

        bytes memory wrapped = abi.encode(bytes("sim"), abi.encode(bytes32("sovereign-job")));
        vm.mockCall(address(0x080C), abi.encode("narrate top tokens"), wrapped);

        vm.prank(address(scheduler));
        narrator.wakeUp(0);

        bytes32 jobId = keccak256(abi.encode(bytes32("sovereign-job")));
        vm.expectEmit(true, false, false, false);
        emit NarrationPublished(jobId, "narration text", block.timestamp);

        vm.prank(ASYNC_DELIVERY);
        narrator.onSovereignAgentResult(jobId, abi.encode("narration text"));
    }
}
