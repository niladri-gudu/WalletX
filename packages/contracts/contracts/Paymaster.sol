// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IEntryPoint {
    function depositTo(address account) external payable;
}

contract VerifyingPaymaster {
    address public immutable entryPoint;
    address public verifyingSigner;

    constructor(address _entryPoint, address _signer) {
        entryPoint = _entryPoint;
        verifyingSigner = _signer;
    }

    modifier onlyEntryPoint() {
        require(msg.sender == entryPoint, "Not EntryPoint");
        _;
    }

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

    function validatePaymasterUserOp(
        PackedUserOperation calldata userOp,
        bytes32,
        uint256
    ) external onlyEntryPoint returns (bytes memory context, uint256 validationData) {
        require(userOp.paymasterAndData.length >= 65, "too short");

        // Extract last 65 bytes as signature
        uint256 sigOffset = userOp.paymasterAndData.length - 65;
        bytes memory sig = new bytes(65);
        for (uint256 i = 0; i < 65; i++) {
            sig[i] = userOp.paymasterAndData[sigOffset + i];
        }

        // Strip signature from paymasterAndData
        bytes memory paymasterAndDataNoSig = new bytes(sigOffset);
        for (uint256 i = 0; i < sigOffset; i++) {
            paymasterAndDataNoSig[i] = userOp.paymasterAndData[i];
        }

        // Recompute userOpHash without signature
        bytes32 innerHash = keccak256(abi.encode(
            userOp.sender,
            userOp.nonce,
            keccak256(userOp.initCode),
            keccak256(userOp.callData),
            userOp.accountGasLimits,
            userOp.preVerificationGas,
            userOp.gasFees,
            keccak256(paymasterAndDataNoSig)
        ));

        bytes32 userOpHash = keccak256(abi.encode(
            innerHash,
            entryPoint,
            block.chainid
        ));

        // Verify raw signature — no eth prefix
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        address recovered = ecrecover(userOpHash, v, r, s);
        require(recovered == verifyingSigner, "Invalid paymaster signature");
        return ("", 0);
    }

    function postOp(uint8, bytes calldata, uint256, uint256) external onlyEntryPoint {}

    function deposit() external payable {
        IEntryPoint(entryPoint).depositTo{value: msg.value}(address(this));
    }
}