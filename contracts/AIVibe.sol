// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./utils/PrecompileConsumer.sol";

interface ICurveState {
    function graduated() external view returns (bool);
}

interface IFactoryRegistry {
    function tokenToCurve(address token) external view returns (address);
}

contract AIVibe is PrecompileConsumer {
    address public constant ASYNC_DELIVERY = 0x5A16214fF555848411544b005f7Ac063742f39F6;

    struct VibeScore {
        uint8 vibeRating;
        uint8 rugRisk;
        bytes32 summaryHash;
        uint256 scoredAt;
        bool scored;
    }

    struct PendingScore {
        bool exists;
        address requester;
        uint256 commitBlock;
    }

    mapping(address => VibeScore) public scores;
    mapping(address => mapping(bytes32 => PendingScore)) public pendingScores;

    address public owner;
    address public immutable ritualWallet;
    address public factory;

    event VibeScoreSubmitted(address indexed token, bytes32 indexed jobId, address indexed requester);
    event VibeScored(address indexed token, uint8 vibeRating, uint8 rugRisk, string summary);
    event FactoryUpdated(address indexed previousFactory, address indexed newFactory);

    modifier onlyOwner() {
        require(msg.sender == owner, "OWNER");
        _;
    }

    constructor(address _wallet) {
        owner = msg.sender;
        ritualWallet = _wallet;
    }

    function setFactory(address _factory) external onlyOwner {
        address previousFactory = factory;
        factory = _factory;
        emit FactoryUpdated(previousFactory, _factory);
    }

    function scoreToken(address token, bytes calldata encodedLlmPayload) external returns (bytes32 jobId) {
        bytes memory out = _executePrecompile(LLM_PRECOMPILE, encodedLlmPayload);
        jobId = abi.decode(out, (bytes32));
        pendingScores[token][jobId] = PendingScore({exists: true, requester: msg.sender, commitBlock: block.number});
        emit VibeScoreSubmitted(token, jobId, msg.sender);
    }

    function refreshScore(address token, bytes calldata encodedLlmPayload) external payable returns (bytes32 jobId) {
        require(msg.value == 0.001 ether, "FEE");
        require(!scores[token].scored || block.number >= scores[token].scoredAt + 100, "TOO_EARLY");
        bytes memory out = _executePrecompile(LLM_PRECOMPILE, encodedLlmPayload);
        jobId = abi.decode(out, (bytes32));
        pendingScores[token][jobId] = PendingScore({exists: true, requester: msg.sender, commitBlock: block.number});
        emit VibeScoreSubmitted(token, jobId, msg.sender);
    }

    function onAIVibeResult(address token, bytes32 jobId, bytes calldata result) external {
        require(msg.sender == ASYNC_DELIVERY, "ONLY_ASYNC_DELIVERY");
        PendingScore memory p = pendingScores[token][jobId];
        if (!p.exists) return;
        delete pendingScores[token][jobId];

        if (factory != address(0)) {
            address curve = IFactoryRegistry(factory).tokenToCurve(token);
            if (curve == address(0)) return;
            if (ICurveState(curve).graduated()) return;
        }

        (uint8 vibe, uint8 rug, string memory summary) = abi.decode(result, (uint8, uint8, string));
        scores[token] = VibeScore(vibe, rug, keccak256(bytes(summary)), block.number, true);
        emit VibeScored(token, vibe, rug, summary);
    }
}
