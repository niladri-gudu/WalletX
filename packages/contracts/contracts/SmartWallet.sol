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
        bytes callData;
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
        uint256 /* missingAccountFunds */
    ) external onlyEntryPoint returns (uint256 validationData) {
        require(userOp.nonce == nonce, "Invalid nonce");
        require(userOp.sender == address(this), "Invalid sender");

        address recovered = recoverSigner(userOpHash, userOp.signature);
        require(recovered != address(0), "Invalid signer");
        require(recovered == owner, "Invalid signature");

        nonce++;

        return 0; // success
    }

    // =========================
    // Signature Verification
    // =========================
    function recoverSigner(
        bytes32 hash,
        bytes memory signature
    ) internal pure returns (address) {
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
        );

        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);

        return ecrecover(ethSignedHash, v, r, s);
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