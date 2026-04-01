// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SmartWallet {
    address public owner;
    address public entryPoint;
    uint256 public nonce;

    struct SessionKey {
        address allowedTarget; // which address it can call
        uint256 maxAmount; // max ETH per tx
        uint256 validUntil; // expiry timestamp
        bool active;
    }

    mapping(address => SessionKey) public sessionKeys;

    event Executed(address to, uint256 value);
    event SessionKeyAdded(
        address key,
        address target,
        uint256 maxAmount,
        uint256 validUntil
    );
    event SessionKeyRevoked(address key);

    constructor(address _owner, address _entryPoint) {
        owner = _owner;
        entryPoint = _entryPoint;
    }

    modifier onlyEntryPoint() {
        require(msg.sender == entryPoint, "Not EntryPoint");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    receive() external payable {}

    struct PackedUserOperation {
        address sender;
        uint256 nonce;
        bytes initCode;
        bytes callData;
        bytes32 accountGasLimits;
        uint256 preVerificationGas;
        bytes32 gasFees;
        bytes paymasterAndData;
        bytes signature;
    }

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

    // Add a session key — only owner can call this
    function addSessionKey(
        address key,
        address allowedTarget,
        uint256 maxAmount,
        uint256 validUntil
    ) external onlyOwner {
        require(key != address(0), "Invalid key");
        require(validUntil > block.timestamp, "Already expired");
        sessionKeys[key] = SessionKey({
            allowedTarget: allowedTarget,
            maxAmount: maxAmount,
            validUntil: validUntil,
            active: true
        });
        emit SessionKeyAdded(key, allowedTarget, maxAmount, validUntil);
    }

    // Revoke a session key
    function revokeSessionKey(address key) external onlyOwner {
        sessionKeys[key].active = false;
        emit SessionKeyRevoked(key);
    }

    function validateUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external onlyEntryPoint returns (uint256) {
        require(userOp.sender == address(this), "Invalid sender");
        require(userOp.nonce == nonce, "Invalid nonce");

        bytes32 hash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", userOpHash)
        );

        address recovered = recoverSigner(hash, userOp.signature);

        if (recovered == owner) {
            // Owner signature — always valid
        } else {
            // Check session key
            SessionKey memory sk = sessionKeys[recovered];
            require(sk.active, "Invalid signature");
            require(block.timestamp <= sk.validUntil, "Session key expired");

            bytes memory cd = userOp.callData;
            require(cd.length >= 4 + 32 + 32, "Invalid callData");

            address target;
            uint256 value;

            assembly {
                target := mload(add(cd, 36))
                value  := mload(add(cd, 68))
            }

            target = address(uint160(target));
            require(target == sk.allowedTarget, "Target not allowed");
            require(value <= sk.maxAmount, "Amount exceeds limit");
        }

        nonce++;

        if (missingAccountFunds > 0) {
            (bool success, ) = payable(msg.sender).call{
                value: missingAccountFunds
            }("");
            require(success, "Prefund failed");
        }

        return 0;
    }

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
