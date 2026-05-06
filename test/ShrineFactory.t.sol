// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/ShrineFactory.sol";
import "../contracts/ContentGuard.sol";
import "../contracts/AIVibe.sol";

contract ShrineFactoryTest is Test {
    ShrineFactory factory;
    ContentGuard guard;
    AIVibe vibe;

    function setUp() public {
        guard = new ContentGuard();
        vibe = new AIVibe(address(0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948));
        factory = new ShrineFactory(address(guard), address(vibe), address(0x1234), address(this));
        factory.initAIVibeFactoryLink();
    }

    function testDeployToken() public {
        vm.mockCall(address(0x0800), abi.encode("meme", "MEME"), abi.encode(true));
        (address token, address curve) = factory.deployToken("meme", "MEME", "desc", "ipfs://x", "@x");
        assertTrue(token != address(0));
        assertTrue(curve != address(0));
        assertEq(factory.tokenToCurve(token), curve);
    }
}
