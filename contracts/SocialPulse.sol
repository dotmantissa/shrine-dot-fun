// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./utils/PrecompileConsumer.sol";

interface ITwitterMeta {
    function twitterHandle() external view returns (string memory);
}

contract SocialPulse is PrecompileConsumer {
    struct SocialData { uint256 tweetCount; uint256 fetchedAt; }
    mapping(address => SocialData) public socialData;
    event SocialPulseUpdated(address indexed token, uint256 tweetCount, uint256 fetchedAt);

    address public immutable ritualWallet;

    constructor(address _wallet) {
        ritualWallet = _wallet;
    }

    function scoreTwitter(address token) external {
        string memory handle = ITwitterMeta(token).twitterHandle();
        bytes memory response = _executePrecompile(HTTP_PRECOMPILE, abi.encode(handle));
        uint256 count = abi.decode(response, (uint256));
        socialData[token] = SocialData(count, block.number);
        emit SocialPulseUpdated(token, count, block.number);
    }
}
