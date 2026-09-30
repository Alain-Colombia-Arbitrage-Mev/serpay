require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [{ version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } }],
    overrides: {
      // checkTransaction recibe 11 parámetros: el pipeline IR evita el "stack too deep".
      "contracts/safe/SignerGuard.sol": { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 }, viaIR: true } },
    },
  },
  networks: {
    // Avalanche C-Chain. Para desplegar, define la variable DEPLOYER_KEY en tu entorno.
    fuji: { url: "https://api.avax-test.network/ext/bc/C/rpc", chainId: 43113, accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : [] },
    avalanche: { url: "https://api.avax.network/ext/bc/C/rpc", chainId: 43114, accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : [] },
  },
};
