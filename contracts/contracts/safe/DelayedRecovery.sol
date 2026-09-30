// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Enum} from "@safe-global/safe-contracts/contracts/common/Enum.sol";

interface ISafeModuleTarget {
    function isOwner(address owner) external view returns (bool);
    function getOwners() external view returns (address[] memory);
    function execTransactionFromModuleReturnData(address to, uint256 value, bytes memory data, Enum.Operation operation)
        external
        returns (bool success, bytes memory returnData);
}

interface IERC20Like {
    function transfer(address to, uint256 amount) external returns (bool);
}

/// @title DelayedRecovery
/// @notice Módulo de Safe para operar sin la firma del usuario, siempre a la vista y con espera:
///         - SE pay y el custodio pueden retirar fondos, pero SOLO a la dirección de retiro
///           registrada del usuario y tras 48 horas en las que el usuario puede cancelar.
///         - Si el usuario perdió su llave, pueden reemplazarla tras 7 días de aviso cancelables.
///         - El usuario puede cambiar su dirección de retiro con su firma; el cambio también
///           tarda 48 horas en aplicarse.
/// @dev Se habilita como módulo en cada Safe y se combina con SignerGuard, que bloquea cualquier
///      transacción normal que no lleve la firma del usuario.
contract DelayedRecovery {
    uint256 public constant DELAY = 48 hours;
    /// @dev Reemplazar la llave del usuario da control total de la Safe: exige más tiempo de aviso.
    uint256 public constant ROTATION_DELAY = 7 days;
    address internal constant SENTINEL_OWNERS = address(0x1);

    struct Config {
        address user;
        address sepay;
        address custodian;
        address withdrawalTo;
        address pendingWithdrawalTo;
        uint64 pendingSince;
    }

    enum Kind { Withdraw, RotateUser }

    struct Request {
        address safe;
        Kind kind;
        address token; // address(0) = moneda nativa (AVAX)
        uint256 amount;
        address newUser;
        uint64 executeAfter;
        bool approvedBySePay;
        bool approvedByCustodian;
        bool done;
        bool cancelled;
    }

    mapping(address => Config) public configs;
    Request[] public requests;

    event Registered(address indexed safe, address user, address sepay, address custodian, address withdrawalTo);
    event Proposed(uint256 indexed id, address indexed safe, Kind kind, address token, uint256 amount, address to, address newUser, uint64 executeAfter);
    event Approved(uint256 indexed id, address indexed by);
    event Cancelled(uint256 indexed id, address indexed by);
    event Executed(uint256 indexed id, address indexed safe);
    event WithdrawalAddressChangeRequested(address indexed safe, address newWithdrawalTo, uint64 effectiveAt);
    event WithdrawalAddressChangeApplied(address indexed safe, address withdrawalTo);
    event WithdrawalAddressChangeCancelled(address indexed safe);

    error AlreadyRegistered();
    error NotRegistered();
    error InvalidConfig();
    error NotAuthorized();
    error NotOpen();
    error TooEarly(uint64 executeAfter);
    error MissingApproval();
    error InvalidAmount();
    error InvalidAddress();
    error ExecutionFailed();

    // ---------------------------------------------------------------- registro

    /// @notice La Safe se registra a sí misma (transacción firmada por el usuario y SE pay).
    function register(address user, address sepay, address custodian, address withdrawalTo) external {
        address safe = msg.sender;
        if (configs[safe].user != address(0)) revert AlreadyRegistered();
        if (user == address(0) || sepay == address(0) || custodian == address(0) || withdrawalTo == address(0)) revert InvalidConfig();
        if (user == sepay || user == custodian || sepay == custodian) revert InvalidConfig();
        ISafeModuleTarget s = ISafeModuleTarget(safe);
        if (!s.isOwner(user) || !s.isOwner(sepay) || !s.isOwner(custodian)) revert InvalidConfig();
        configs[safe] = Config(user, sepay, custodian, withdrawalTo, address(0), 0);
        emit Registered(safe, user, sepay, custodian, withdrawalTo);
    }

    /// @notice Usado por SignerGuard para saber quién es el usuario de cada Safe.
    function userOf(address safe) external view returns (address) {
        return configs[safe].user;
    }

    function requestsCount() external view returns (uint256) {
        return requests.length;
    }

    // ---------------------------------------------------------------- propuestas

    function proposeWithdrawal(address safe, address token, uint256 amount) external returns (uint256 id) {
        if (amount == 0) revert InvalidAmount();
        Config storage c = _operator(safe);
        id = _push(safe, Kind.Withdraw, token, amount, address(0), c);
        emit Proposed(id, safe, Kind.Withdraw, token, amount, c.withdrawalTo, address(0), requests[id].executeAfter);
    }

    function proposeUserRotation(address safe, address newUser) external returns (uint256 id) {
        Config storage c = _operator(safe);
        if (newUser == address(0) || ISafeModuleTarget(safe).isOwner(newUser)) revert InvalidAddress();
        id = _push(safe, Kind.RotateUser, address(0), 0, newUser, c);
        emit Proposed(id, safe, Kind.RotateUser, address(0), 0, address(0), newUser, requests[id].executeAfter);
    }

    function approve(uint256 id) external {
        Request storage r = _open(id);
        Config storage c = configs[r.safe];
        if (msg.sender == c.sepay) r.approvedBySePay = true;
        else if (msg.sender == c.custodian) r.approvedByCustodian = true;
        else revert NotAuthorized();
        emit Approved(id, msg.sender);
    }

    /// @notice El usuario (o su Safe) puede cancelar cualquier propuesta durante la espera.
    function cancel(uint256 id) external {
        Request storage r = _open(id);
        if (msg.sender != configs[r.safe].user && msg.sender != r.safe) revert NotAuthorized();
        r.cancelled = true;
        emit Cancelled(id, msg.sender);
    }

    /// @notice Cualquiera puede ejecutar una propuesta aprobada por SE pay y el custodio tras 48 horas.
    function execute(uint256 id) external {
        Request storage r = _open(id);
        if (block.timestamp < r.executeAfter) revert TooEarly(r.executeAfter);
        if (!r.approvedBySePay || !r.approvedByCustodian) revert MissingApproval();
        r.done = true;
        Config storage c = configs[r.safe];

        if (r.kind == Kind.Withdraw) {
            if (r.token == address(0)) {
                _exec(r.safe, c.withdrawalTo, r.amount, "");
            } else {
                bytes memory ret = _exec(r.safe, r.token, 0, abi.encodeCall(IERC20Like.transfer, (c.withdrawalTo, r.amount)));
                if (ret.length > 0 && !abi.decode(ret, (bool))) revert ExecutionFailed();
            }
        } else {
            address prev = _prevOwner(r.safe, c.user);
            _exec(r.safe, r.safe, 0, abi.encodeWithSignature("swapOwner(address,address,address)", prev, c.user, r.newUser));
            c.user = r.newUser;
        }
        emit Executed(id, r.safe);
    }

    // ---------------------------------------------------------------- dirección de retiro

    /// @notice Llamado por la Safe (con la firma del usuario, exigida por SignerGuard).
    function requestWithdrawalAddressChange(address newWithdrawalTo) external {
        Config storage c = configs[msg.sender];
        if (c.user == address(0)) revert NotRegistered();
        if (newWithdrawalTo == address(0)) revert InvalidAddress();
        c.pendingWithdrawalTo = newWithdrawalTo;
        c.pendingSince = uint64(block.timestamp);
        emit WithdrawalAddressChangeRequested(msg.sender, newWithdrawalTo, uint64(block.timestamp + DELAY));
    }

    function applyWithdrawalAddressChange(address safe) external {
        Config storage c = configs[safe];
        if (c.pendingWithdrawalTo == address(0)) revert NotOpen();
        if (block.timestamp < c.pendingSince + DELAY) revert TooEarly(uint64(c.pendingSince + DELAY));
        c.withdrawalTo = c.pendingWithdrawalTo;
        c.pendingWithdrawalTo = address(0);
        c.pendingSince = 0;
        emit WithdrawalAddressChangeApplied(safe, c.withdrawalTo);
    }

    function cancelWithdrawalAddressChange(address safe) external {
        Config storage c = configs[safe];
        if (msg.sender != c.user && msg.sender != safe) revert NotAuthorized();
        if (c.pendingWithdrawalTo == address(0)) revert NotOpen();
        c.pendingWithdrawalTo = address(0);
        c.pendingSince = 0;
        emit WithdrawalAddressChangeCancelled(safe);
    }

    // ---------------------------------------------------------------- internos

    function _operator(address safe) internal view returns (Config storage c) {
        c = configs[safe];
        if (c.user == address(0)) revert NotRegistered();
        if (msg.sender != c.sepay && msg.sender != c.custodian) revert NotAuthorized();
    }

    function _push(address safe, Kind kind, address token, uint256 amount, address newUser, Config storage c)
        internal
        returns (uint256 id)
    {
        id = requests.length;
        requests.push(
            Request({
                safe: safe,
                kind: kind,
                token: token,
                amount: amount,
                newUser: newUser,
                executeAfter: uint64(block.timestamp + (kind == Kind.RotateUser ? ROTATION_DELAY : DELAY)),
                approvedBySePay: msg.sender == c.sepay,
                approvedByCustodian: msg.sender == c.custodian,
                done: false,
                cancelled: false
            })
        );
    }

    function _open(uint256 id) internal view returns (Request storage r) {
        if (id >= requests.length) revert NotOpen();
        r = requests[id];
        if (r.done || r.cancelled) revert NotOpen();
    }

    function _exec(address safe, address to, uint256 value, bytes memory data) internal returns (bytes memory ret) {
        bool ok;
        (ok, ret) = ISafeModuleTarget(safe).execTransactionFromModuleReturnData(to, value, data, Enum.Operation.Call);
        if (!ok) revert ExecutionFailed();
    }

    function _prevOwner(address safe, address owner) internal view returns (address) {
        address[] memory owners = ISafeModuleTarget(safe).getOwners();
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == owner) return i == 0 ? SENTINEL_OWNERS : owners[i - 1];
        }
        revert InvalidAddress();
    }
}
