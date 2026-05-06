// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ShrineToken.sol";

interface IDEXRouter {
    function finalizeGraduation(address token, uint256 tokenAmount, uint256 ritualAmount, address creator, address[3] calldata topHolders) external;
}

contract BondingCurve {
    ShrineToken public token;
    address public treasury;
    address public creator;
    address public dexRouter;

    uint256 public constant virtualRITUAL_INITIAL = 30e18;
    uint256 public constant virtualTokenInitial = 1_073_000_191e18;
    uint256 public virtualRITUAL = virtualRITUAL_INITIAL;
    uint256 public virtualToken = virtualTokenInitial;

    uint256 public feeBps = 100;
    uint256 public graduationThreshold = 69_000e18;
    uint256 public realRitualReserve;
    bool public graduated;

    event Trade(address indexed trader, bool isBuy, uint256 ritualAmount, uint256 tokenAmount, uint256 price, uint256 marketCap);

    constructor(address _token, address _treasury, address _creator, address _dexRouter) {
        token = ShrineToken(_token);
        treasury = _treasury;
        creator = _creator;
        dexRouter = _dexRouter;
    }

    receive() external payable {}

    function buy(uint256 minTokensOut) external payable returns (uint256 tokensOut) {
        require(!graduated, "GRADUATED");
        require(msg.value > 0, "NO_VALUE");
        uint256 fee = (msg.value * feeBps) / 10_000;
        uint256 amountIn = msg.value - fee;
        _distributeFee(fee);

        uint256 k = virtualRITUAL * virtualToken;
        uint256 newVirtualRitual = virtualRITUAL + amountIn;
        uint256 newVirtualToken = k / newVirtualRitual;
        tokensOut = virtualToken - newVirtualToken;
        uint256 available = token.MAX_SUPPLY() - token.totalSupply();
        if (tokensOut > available) {
            tokensOut = available;
        }
        require(tokensOut >= minTokensOut, "SLIPPAGE");

        virtualRITUAL = newVirtualRitual;
        virtualToken = newVirtualToken;
        realRitualReserve += amountIn;
        token.mint(msg.sender, tokensOut);

        emit Trade(msg.sender, true, amountIn, tokensOut, getCurrentPrice(), getMarketCap());
    }

    function sell(uint256 tokenAmount, uint256 minRitualOut) external returns (uint256 ritualOut) {
        require(!graduated, "GRADUATED");
        require(tokenAmount > 0, "NO_AMOUNT");

        uint256 k = virtualRITUAL * virtualToken;
        uint256 newVirtualToken = virtualToken + tokenAmount;
        uint256 newVirtualRitual = k / newVirtualToken;
        uint256 grossOut = virtualRITUAL - newVirtualRitual;
        uint256 fee = (grossOut * feeBps) / 10_000;
        ritualOut = grossOut - fee;

        require(ritualOut >= minRitualOut, "SLIPPAGE");
        require(address(this).balance >= ritualOut, "INSUFFICIENT_ETH");

        token.transferFrom(msg.sender, address(this), tokenAmount);
        token.burn(address(this), tokenAmount);

        virtualToken = newVirtualToken;
        virtualRITUAL = newVirtualRitual;
        realRitualReserve = realRitualReserve > grossOut ? realRitualReserve - grossOut : 0;

        _distributeFee(fee);
        (bool ok,) = msg.sender.call{value: ritualOut}("");
        require(ok, "TRANSFER_FAIL");

        emit Trade(msg.sender, false, ritualOut, tokenAmount, getCurrentPrice(), getMarketCap());
    }

    function graduate(address[3] calldata topHolders) external {
        require(!graduated, "GRADUATED");
        require(realRitualReserve >= graduationThreshold, "NOT_READY");
        graduated = true;

        uint256 remaining = token.MAX_SUPPLY() - token.totalSupply();
        if (remaining > 0) token.mint(address(this), remaining);

        token.setDexRouter(dexRouter);
        IDEXRouter(dexRouter).finalizeGraduation(address(token), token.balanceOf(address(this)), realRitualReserve, creator, topHolders);
    }

    function getCurrentPrice() public view returns (uint256) {
        return (virtualRITUAL * 1e18) / virtualToken;
    }

    function getMarketCap() public view returns (uint256) {
        return (getCurrentPrice() * token.totalSupply()) / 1e18;
    }

    function _distributeFee(uint256 fee) internal {
        if (fee == 0) return;
        uint256 half = fee / 2;
        (bool ok1,) = treasury.call{value: half}("");
        (bool ok2,) = creator.call{value: fee - half}("");
        require(ok1 && ok2, "FEE_TRANSFER");
    }
}
