// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseGuard} from "@safe-global/safe-contracts/contracts/base/GuardManager.sol";
import {Enum} from "@safe-global/safe-contracts/contracts/common/Enum.sol";

interface ISafeForGuard {
    function nonce() external view returns (uint256);
    function getThreshold() external view returns (uint256);
    function getTransactionHash(
        address to,
        uint256 value,
        bytes calldata data,
        Enum.Operation operation,
        uint256 safeTxGas,
        uint256 baseGas,
        uint256 gasPrice,
        address gasToken,
        address refundReceiver,
        uint256 _nonce
    ) external view returns (bytes32);
}

interface IUserRegistry {
    function userOf(address safe) external view returns (address);
}

/// @title SignerGuard
/// @notice Guardia para las Safes de SE pay: ninguna transacción normal de la Safe se ejecuta
///         sin la firma del usuario. Si SE pay y el custodio necesitan mover fondos sin él,
///         deben usar DelayedRecovery, que solo paga a la dirección registrada del usuario
///         y con 48 horas de espera en las que el usuario puede cancelar.
/// @dev La Safe (v1.4.1) valida las firmas antes de llamar a checkTransaction; aquí solo se
///      identifica quién firmó. msg.sender es la Safe.
contract SignerGuard is BaseGuard {
    IUserRegistry public immutable registry;

    error MissingUserSignature(address safe, address user);

    constructor(IUserRegistry registry_) {
        registry = registry_;
    }

    function checkTransaction(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation,
        uint256 safeTxGas,
        uint256 baseGas,
        uint256 gasPrice,
        address gasToken,
        address payable refundReceiver,
        bytes memory signatures,
        address /* msgSender */
    ) external view override {
        address safe = msg.sender;
        address user = registry.userOf(safe);
        // Safe aún no registrada: la configuración inicial la firman el usuario y SE pay.
        if (user == address(0)) return;

        ISafeForGuard s = ISafeForGuard(safe);
        // execTransaction ya incrementó el nonce: el hash firmado usa nonce - 1.
        bytes32 txHash = s.getTransactionHash(
            to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, s.nonce() - 1
        );
        if (!_signedBy(txHash, signatures, s.getThreshold(), user)) revert MissingUserSignature(safe, user);
    }

    function checkAfterExecution(bytes32, bool) external pure override {}

    /// @dev Recorre las primeras `threshold` firmas con el mismo formato que Safe.checkNSignatures.
    function _signedBy(bytes32 txHash, bytes memory signatures, uint256 threshold, address who)
        internal
        pure
        returns (bool)
    {
        for (uint256 i = 0; i < threshold; i++) {
            (uint8 v, bytes32 r, bytes32 s) = _split(signatures, i);
            address owner;
            if (v == 0 || v == 1) {
                // 0: firma de contrato (EIP-1271) · 1: hash aprobado on-chain o enviado por el dueño.
                owner = address(uint160(uint256(r)));
            } else if (v > 30) {
                owner = ecrecover(keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", txHash)), v - 4, r, s);
            } else {
                owner = ecrecover(txHash, v, r, s);
            }
            if (owner == who) return true;
        }
        return false;
    }

    function _split(bytes memory signatures, uint256 pos) internal pure returns (uint8 v, bytes32 r, bytes32 s) {
        assembly {
            let p := mul(0x41, pos)
            r := mload(add(signatures, add(p, 0x20)))
            s := mload(add(signatures, add(p, 0x40)))
            v := and(mload(add(signatures, add(p, 0x41))), 0xff)
        }
    }
}
