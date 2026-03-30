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

    struct UserOperation {
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
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256
    )
        external
        onlyEntryPoint
        returns (bytes memory context, uint256 validationData)
    {
        bytes memory sig = new bytes(65);
        uint256 start = userOp.paymasterAndData.length - 65;
        for (uint256 i = 0; i < 65; i++) {
            sig[i] = userOp.paymasterAndData[start + i];
        }

        bytes memory paymasterAndDataWithoutSig = new bytes(start);
        for (uint256 i = 0; i < start; i++) {
            paymasterAndDataWithoutSig[i] = userOp.paymasterAndData[i];
        }

        // Rebuild userOp hash with empty paymasterData sig — matches what JS signed
        bytes32 reconstructedHash = keccak256(
            abi.encodePacked(
                keccak256(
                    abi.encode(
                        userOp.sender,
                        userOp.nonce,
                        keccak256(userOp.initCode),
                        keccak256(userOp.callData),
                        userOp.accountGasLimits,
                        userOp.preVerificationGas,
                        userOp.gasFees,
                        keccak256(paymasterAndDataWithoutSig) // ← without sig
                    )
                ),
                entryPoint,
                block.chainid
            )
        );

        bytes32 ethHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                reconstructedHash
            )
        );

        address recovered = recoverSigner(ethHash, sig);
        require(recovered == verifyingSigner, "Invalid paymaster signature");

        return ("", 0);
    }

    function postOp(
        uint8,
        bytes calldata,
        uint256,
        uint256
    ) external onlyEntryPoint {}

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

    function deposit() external payable {
        IEntryPoint(entryPoint).depositTo{value: msg.value}(address(this));
    }
}
