# Contratos de SE pay

Protecciones de las wallets multisig Safe (v1.4.1) de SE pay en Avalanche C-Chain.

| Contrato | Qué hace |
|---|---|
| `contracts/safe/SignerGuard.sol` | Guardia de la Safe: bloquea cualquier transacción normal que no lleve la firma del usuario. |
| `contracts/safe/DelayedRecovery.sol` | Módulo de la Safe: SE pay y el custodio pueden retirar sin el usuario solo a su dirección registrada y tras 48 horas cancelables; reemplazar la llave del usuario exige 7 días de aviso; cambiar la dirección de retiro exige la firma del usuario y 48 horas. |

## Cómo se configura cada Safe

Dueños: usuario, SE pay y custodio, con 2 de 3 firmas. Con la firma del usuario y de SE pay:

1. `DelayedRecovery.register(usuario, sepay, custodio, direccionDeRetiro)`
2. `Safe.enableModule(DelayedRecovery)`
3. `Safe.setGuard(SignerGuard)`

## Pruebas

Se prueban contra la Safe oficial 1.4.1 (`@safe-global/safe-contracts`).

```bash
npm install --legacy-peer-deps
npx hardhat test
```

## Estado

Sin auditoría externa todavía. No usar con fondos reales hasta completar la auditoría.
