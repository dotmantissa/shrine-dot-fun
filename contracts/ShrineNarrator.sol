// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./utils/PrecompileConsumer.sol";

interface IScheduler {
    function schedule(bytes calldata, uint64, uint32, uint8, uint8, uint8, uint256, uint256, uint256, address) external returns (uint256);
}

contract ShrineNarrator is PrecompileConsumer {
    address public owner;
    address public immutable scheduler;
    address public immutable asyncDelivery;
    bool public isRunning;
    bool public schedulerApproved;
    uint256 public narrateId;
    uint32 public wakeInterval = 200;

    mapping(address => string) public lastNarration;

    event NarrationPublished(bytes32 indexed jobId, string resultText, uint256 timestamp);

    modifier onlyOwner() { require(msg.sender == owner, "OWNER"); _; }

    constructor(address _scheduler, address _asyncDelivery) {
        owner = msg.sender;
        scheduler = _scheduler;
        asyncDelivery = _asyncDelivery;
    }

    function approveScheduler(address schedulerAddress) external onlyOwner {
        require(schedulerAddress == scheduler, "BAD_SCHEDULER");
        schedulerApproved = true;
    }

    function start() external onlyOwner {
        require(schedulerApproved, "SCHEDULER_NOT_APPROVED");
        isRunning = true;
        narrateId = _scheduleNext(10);
    }

    function wakeUp(uint256) external {
        require(msg.sender == scheduler, "ONLY_SCHEDULER");
        bytes memory out = _executePrecompile(SOVEREIGN_AGENT_PRECOMPILE, abi.encode("narrate top tokens"));
        bytes32 jobId = keccak256(out);
        emit NarrationPublished(jobId, "job-submitted", block.timestamp);
        narrateId = _scheduleNext(wakeInterval);
    }

    function onSovereignAgentResult(bytes32 jobId, bytes calldata result) external {
        require(msg.sender == asyncDelivery, "ONLY_ASYNC_DELIVERY");
        string memory text = abi.decode(result, (string));
        emit NarrationPublished(jobId, text, block.timestamp);
    }

    function _scheduleNext(uint32 delay) internal returns (uint256) {
        return IScheduler(scheduler).schedule(
            abi.encodeWithSelector(this.wakeUp.selector, uint256(0)),
            600_000,
            uint32(block.number) + delay,
            3,
            1,
            50,
            block.basefee,
            2 gwei,
            0,
            address(this)
        );
    }
}
