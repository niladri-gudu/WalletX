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

    // =========================
    // ERC-4337 UserOperation
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
    // Validate Paymaster
    // =========================
    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 /* maxCost */
    )
        external
        onlyEntryPoint
        returns (bytes memory context, uint256 validationData)
    {
        // require(
        //     userOp.paymasterAndData.length == 85,
        //     "wrong paymasterAndData length"
        // );
        // require(userOp.paymasterAndData.length >= 20, "too short");

        // // Extract signature from paymasterAndData
        // bytes memory signature = userOp.paymasterAndData[20:];
        // require(signature.length == 65, "wrong sig length");

        // // Create hash signed by backend
        // bytes32 rawHash = keccak256(
        //     abi.encodePacked(
        //         userOp.sender,
        //         userOp.nonce,
        //         keccak256(userOp.initCode),
        //         keccak256(userOp.callData),
        //         userOp.callGasLimit,
        //         userOp.verificationGasLimit,
        //         userOp.preVerificationGas,
        //         address(this),
        //         block.chainid
        //     )
        // );

        // // Step 2: wrap with Ethereum prefix to match signMessage on backend
        // bytes32 hash = keccak256(
        //     abi.encodePacked("\x19Ethereum Signed Message:\n32", rawHash)
        // );

        // address recovered = recoverSigner(hash, signature);

        // require(recovered == verifyingSigner, "Invalid paymaster signature");

        return ("", 0);
    }

    // =========================
    // Post Operation (optional)
    // =========================
    function postOp(
        uint8 /* mode */,
        bytes calldata /* context */,
        uint256 /* actualGasCost */
    ) external onlyEntryPoint {}

    // =========================
    // Signature Recovery
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

    // =========================
    // Deposit Helper
    // =========================
    function deposit() external payable {
        IEntryPoint(entryPoint).depositTo{value: msg.value}(address(this));
    }

    function computeHash(
        UserOperation calldata userOp
    ) external view returns (bytes32 rawHash, bytes32 finalHash) {
        rawHash = keccak256(
            abi.encodePacked(
                userOp.sender,
                userOp.nonce,
                keccak256(userOp.initCode),
                keccak256(userOp.callData),
                userOp.callGasLimit,
                userOp.verificationGasLimit,
                userOp.preVerificationGas,
                address(this),
                block.chainid
            )
        );
        finalHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", rawHash)
        );
    }
}
