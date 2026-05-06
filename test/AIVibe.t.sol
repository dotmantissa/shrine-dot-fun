// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/AIVibe.sol";

contract MockCurve {
    bool public graduated;
    function setGraduated(bool v) external { graduated = v; }
}

contract MockFactory {
    mapping(address => address) public tokenToCurve;
    function set(address token, address curve) external { tokenToCurve[token] = curve; }
}

contract AIVibeTest is Test {
    AIVibe vibe;
    MockFactory factory;
    MockCurve curve;
    address token = address(0xABCD);
    address constant ASYNC_DELIVERY = 0x5A16214fF555848411544b005f7Ac063742f39F6;

    function setUp() public {
        vibe = new AIVibe(address(0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948));
        factory = new MockFactory();
        curve = new MockCurve();
        factory.set(token, address(curve));
        vibe.setFactory(address(factory));
    }

    function testVibeScore() public {
        bytes32 jobId = keccak256("job");
        bytes memory wrapped = abi.encode(bytes("sim"), abi.encode(jobId));
        vm.mockCall(address(0x0802), bytes("payload"), wrapped);

        bytes32 got = vibe.scoreToken(token, bytes("payload"));
        assertEq(got, jobId);

        vm.prank(ASYNC_DELIVERY);
        vibe.onAIVibeResult(token, jobId, abi.encode(uint8(90), uint8(20), string("Strong social momentum")));

        (uint8 v, uint8 r,, , bool scored) = vibe.scores(token);
        assertEq(v, 90);
        assertEq(r, 20);
        assertTrue(scored);
    }

    function testTOCTOU() public {
        bytes32 jobId = keccak256("job2");
        bytes memory wrapped = abi.encode(bytes("sim"), abi.encode(jobId));
        vm.mockCall(address(0x0802), bytes("payload2"), wrapped);

        vibe.scoreToken(token, bytes("payload2"));
        curve.setGraduated(true);

        vm.prank(ASYNC_DELIVERY);
        vibe.onAIVibeResult(token, jobId, abi.encode(uint8(80), uint8(10), string("ignored")));

        (, , , , bool scored) = vibe.scores(token);
        assertFalse(scored);
    }
}
