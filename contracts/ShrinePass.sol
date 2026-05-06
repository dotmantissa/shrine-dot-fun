// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ShrinePass {
    string public name = "Shrine Pass";
    string public symbol = "SPASS";
    address public router;
    uint256 public totalSupply;

    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => string) public tokenURI;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    modifier onlyRouter() {
        require(msg.sender == router, "ONLY_ROUTER");
        _;
    }

    constructor(address _router) {
        router = _router;
    }

    function mintOnGraduation(address token, address[3] calldata topHolders) external onlyRouter {
        for (uint256 i; i < 3; i++) {
            totalSupply++;
            uint256 id = totalSupply;
            ownerOf[id] = topHolders[i];
            balanceOf[topHolders[i]]++;
            tokenURI[id] = string(abi.encodePacked("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><text x='10' y='20'>Shrine Pass ", _toString(i + 1), " ", _toHex(token), "</text></svg>"));
            emit Transfer(address(0), topHolders[i], id);
        }
    }

    function _toString(uint256 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint256 j = v;
        uint256 len;
        while (j != 0) { len++; j /= 10; }
        bytes memory b = new bytes(len);
        while (v != 0) { len--; b[len] = bytes1(uint8(48 + v % 10)); v /= 10; }
        return string(b);
    }

    function _toHex(address a) internal pure returns (string memory) {
        bytes20 data = bytes20(a);
        bytes memory out = new bytes(42);
        out[0] = '0'; out[1] = 'x';
        bytes16 hexSymbols = 0x30313233343536373839616263646566;
        for (uint256 i; i < 20; i++) {
            out[2 + i * 2] = bytes1(hexSymbols[uint8(data[i] >> 4)]);
            out[3 + i * 2] = bytes1(hexSymbols[uint8(data[i] & 0x0f)]);
        }
        return string(out);
    }
}
