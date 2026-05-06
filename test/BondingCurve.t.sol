// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/ShrineToken.sol";
import "../contracts/BondingCurve.sol";
import "../contracts/DEXRouter.sol";
import "../contracts/ShrinePass.sol";

contract BondingCurveTest is Test {
    ShrineToken token;
    BondingCurve curve;
    DEXRouter router;
    ShrinePass pass;

    address treasury = address(0xBEEF);
    address creator = address(0xCAFE);
    address top1 = address(0x1111);
    address top2 = address(0x2222);
    address top3 = address(0x3333);

    function setUp() public {
        vm.deal(address(this), 1_000_000 ether);
        vm.deal(creator, 1_000_000 ether);
        router = new DEXRouter(treasury);
        pass = new ShrinePass(address(router));
        router.setShrinePass(address(pass));

        token = new ShrineToken("m","m","d","i","t",creator);
        curve = new BondingCurve(address(token), treasury, creator, address(router));
        token.setCurve(address(curve));
    }

    receive() external payable {}

    function testBuy() public {
        assertEq(curve.virtualRITUAL(), 30e18);
        assertEq(curve.virtualToken(), 1_073_000_191e18);
        uint256 out = curve.buy{value: 1 ether}(0);
        assertGt(out, 0);
    }

    function testSell() public {
        uint256 out = curve.buy{value: 1 ether}(0);
        token.approve(address(curve), out);
        uint256 ritualOut = curve.sell(out / 2, 0);
        assertGt(ritualOut, 0);
    }

    function testGraduation() public {
        while (curve.realRitualReserve() < 69_000e18) {
            curve.buy{value: 1000 ether}(0);
        }

        address[3] memory top = [top1, top2, top3];
        curve.graduate(top);

        (, uint256 ritualReserve, bool exists) = router.pairs(address(token));
        assertTrue(exists);
        assertGt(ritualReserve, 0);
        assertTrue(curve.graduated());
        assertGt(router.lpBalance(address(token), creator), 0);
        assertGt(router.lpBalance(address(token), treasury), 0);
        assertEq(pass.balanceOf(top1), 1);
    }
}
