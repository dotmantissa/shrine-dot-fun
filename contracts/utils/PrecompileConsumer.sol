// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

abstract contract PrecompileConsumer {
    address internal constant ONNX_PRECOMPILE = address(0x0800);
    address internal constant HTTP_PRECOMPILE = address(0x0801);
    address internal constant LLM_PRECOMPILE = address(0x0802);
    address internal constant JQ_PRECOMPILE = address(0x0803);
    address internal constant SOVEREIGN_AGENT_PRECOMPILE = address(0x080C);
    address internal constant PERSISTENT_AGENT_PRECOMPILE = address(0x0820);

    function _executePrecompile(address precompile, bytes memory encodedInput) internal returns (bytes memory) {
        (bool ok, bytes memory result) = precompile.call(encodedInput);
        require(ok, "PRECOMPILE_CALL_FAILED");
        if (precompile == HTTP_PRECOMPILE || precompile == LLM_PRECOMPILE || precompile == SOVEREIGN_AGENT_PRECOMPILE) {
            (bytes memory simmedInput, bytes memory actualOutput) = abi.decode(result, (bytes, bytes));
            simmedInput;
            return actualOutput;
        }
        return result;
    }

    function _executePrecompileView(address precompile, bytes memory encodedInput) internal view returns (bytes memory) {
        (bool ok, bytes memory result) = precompile.staticcall(encodedInput);
        require(ok, "PRECOMPILE_STATICCALL_FAILED");
        return result;
    }
}
