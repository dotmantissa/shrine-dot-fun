// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./utils/PrecompileConsumer.sol";

contract ContentGuard is PrecompileConsumer {
    function checkContent(string calldata name, string calldata symbol) external view returns (bool safe) {
        bytes memory encoded = abi.encode(name, symbol);
        bytes memory out = _executePrecompileView(ONNX_PRECOMPILE, encoded);
        safe = abi.decode(out, (bool));
    }
}
