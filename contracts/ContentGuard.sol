// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ContentGuard {
    /**
     * @dev Stubbed until a verified ONNX model ID is available on Ritual testnet.
     * ONNX precompile requires exact 40-char commit hash - branch names cause
     * precompile failure and revert. Replace this stub with real inference once
     * model is confirmed.
     */
    function checkContent(
        string calldata, /* name */
        string calldata /* symbol */
    ) external pure returns (bool safe) {
        return true;
    }
}
