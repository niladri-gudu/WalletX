// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SmartWallet {
    address public owner;
    address public entryPoint;
    uint256 public nonce;

    event Executed(address to, uint256 value);

    constructor(address _owner, address _entryPoint) {
        owner = _owner;
        entryPoint = _entryPoint;
    }

    modifier onlyEntryPoint() {
        require(msg.sender == entryPoint, "Not EntryPoint");
        _;
    }

    receive() external payable {}

    // =========================
    // ERC-4337 UserOperation Struct (Minimal)
    // =========================
    struct UserOperation {
        address sender;
        uint256 nonce;
        bytes initCode;
        bytes callData;
        uint256 callGasLimit;
        uint256 verificationGasLimit;
        uint256 preVerificationGas;
        uint256 maxFeePerGas;
        uint256 maxPriorityFeePerGas;
        bytes paymasterAndData;
        bytes signature;
    }

    // =========================
    // Execute Function
    // =========================
    function execute(
        address to,
        uint256 value,
        bytes calldata data
    ) external onlyEntryPoint {
        require(to != address(0), "Invalid target");

        (bool success, ) = to.call{value: value}(data);
        require(success, "Execution failed");

        emit Executed(to, value);
    }

    // =========================
    // ERC-4337 Validation Function
    // =========================
    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external onlyEntryPoint returns (uint256 validationData) {
        require(msg.sender == entryPoint, "Not EntryPoint");

        require(userOp.sender == address(this), "Invalid sender");
        require(userOp.nonce == nonce, "Invalid nonce");

        address recovered = recoverSigner(userOpHash, userOp.signature);
        require(recovered == owner, "Invalid signature");

        nonce++;

        if (missingAccountFunds > 0) {
            (bool success, ) = payable(msg.sender).call{
                value: missingAccountFunds
            }("");
            require(success, "Prefund failed");
        }

        return 0;
    }

    // =========================
    // Signature Verification
    // =========================
    function recoverSigner(
        bytes32 hash,
        bytes memory signature
    ) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(hash, v, r, s);
    }

    function splitSignature(
        bytes memory sig
    ) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}
