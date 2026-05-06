// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ShrineToken.sol";
import "./BondingCurve.sol";
import "./ContentGuard.sol";

interface IAIVibe {
    function setFactory(address _factory) external;
}

contract ShrineFactory {
    address public owner;
    address public treasury;
    uint256 public graduationThreshold = 69_000e18;
    uint256 public feeRateBps = 100;

    ContentGuard public contentGuard;
    IAIVibe public aivibe;
    address public dexRouter;

    struct TokenMeta {
        string name;
        string symbol;
        string description;
        string imageURI;
        string twitterHandle;
    }

    mapping(address => address) public tokenToCurve;
    mapping(address => TokenMeta) public metadata;

    event TokenLaunched(address indexed token, address indexed curve, address indexed creator, uint256 timestamp, string twitterHandle);

    modifier onlyOwner() { require(msg.sender == owner, "OWNER"); _; }

    constructor(address _contentGuard, address _aivibe, address _dexRouter, address _treasury) {
        owner = msg.sender;
        contentGuard = ContentGuard(_contentGuard);
        aivibe = IAIVibe(_aivibe);
        dexRouter = _dexRouter;
        treasury = _treasury;
    }

    function initAIVibeFactoryLink() external onlyOwner {
        aivibe.setFactory(address(this));
    }

    function deployToken(
        string calldata name,
        string calldata symbol,
        string calldata description,
        string calldata imageURI,
        string calldata twitterHandle
    ) external returns (address token, address curve) {
        require(contentGuard.checkContent(name, symbol), "UNSAFE_CONTENT");
        ShrineToken t = new ShrineToken(name, symbol, description, imageURI, twitterHandle, msg.sender);
        BondingCurve c = new BondingCurve(address(t), treasury, msg.sender, dexRouter);
        t.setCurve(address(c));

        token = address(t);
        curve = address(c);
        tokenToCurve[token] = curve;
        metadata[token] = TokenMeta(name, symbol, description, imageURI, twitterHandle);

        emit TokenLaunched(token, curve, msg.sender, block.timestamp, twitterHandle);
    }

    function setGraduationThreshold(uint256 v) external onlyOwner { graduationThreshold = v; }
    function setFeeRate(uint256 v) external onlyOwner { feeRateBps = v; }
}
