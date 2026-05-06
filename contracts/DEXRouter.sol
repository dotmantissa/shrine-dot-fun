// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ShrinePass.sol";

contract DEXRouter {
    address public treasury;
    ShrinePass public shrinePass;

    struct Pair {
        uint256 tokenReserve;
        uint256 ritualReserve;
        bool exists;
    }

    mapping(address => Pair) public pairs;
    mapping(address => mapping(address => uint256)) public lpBalance;

    event TokenGraduated(address indexed token, address indexed pair, uint256 liquidity);

    constructor(address _treasury) {
        treasury = _treasury;
    }

    function setShrinePass(address pass) external {
        require(address(shrinePass) == address(0), "PASS_SET");
        shrinePass = ShrinePass(pass);
    }

    function createPair(address token) public returns (address) {
        pairs[token].exists = true;
        return token;
    }

    function addLiquidity(address token, uint256 tokenAmount, uint256 ritualAmount, address creator) public {
        Pair storage p = pairs[token];
        require(p.exists, "PAIR");
        p.tokenReserve += tokenAmount;
        p.ritualReserve += ritualAmount;
        uint256 lp = tokenAmount + ritualAmount;
        lpBalance[token][creator] += lp / 2;
        lpBalance[token][treasury] += lp - (lp / 2);
        emit TokenGraduated(token, token, lp);
    }

    function finalizeGraduation(address token, uint256 tokenAmount, uint256 ritualAmount, address creator, address[3] calldata topHolders) external {
        createPair(token);
        addLiquidity(token, tokenAmount, ritualAmount, creator);
        if (address(shrinePass) != address(0)) {
            shrinePass.mintOnGraduation(token, topHolders);
        }
    }

    function swap(address, uint256, address, uint256, uint256) external pure returns (uint256) {
        revert("NOT_IMPLEMENTED");
    }
}
