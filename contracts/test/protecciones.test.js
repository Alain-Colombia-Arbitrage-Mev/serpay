// Pruebas de las protecciones de las Safes de SE pay contra la Safe oficial 1.4.1.
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

const H48 = 48 * 3600;
const D7 = 7 * 24 * 3600;
const ZERO = ethers.ZeroAddress;

describe("Protecciones de la Safe: firma del usuario + espera", function () {
  let payer, user, sepay, custodian, stranger, newUser, withdrawTo, other;
  let safe, usdc, recovery, guard;

  // Firma una transacción de la Safe con las llaves indicadas y la ejecuta.
  async function execSafe(signers, to, data, value = 0n) {
    const nonce = await safe.nonce();
    const hash = await safe.getTransactionHash(to, value, data, 0, 0, 0, 0, ZERO, ZERO, nonce);
    const sorted = [...signers].sort((a, b) => (BigInt(a.address) < BigInt(b.address) ? -1 : 1));
    const sigs = ethers.concat(sorted.map((w) => w.signingKey.sign(hash).serialized));
    return safe.connect(payer).execTransaction(to, value, data, 0, 0, 0, 0, ZERO, ZERO, sigs);
  }

  const wallet = () => ethers.Wallet.createRandom().connect(ethers.provider);

  beforeEach(async function () {
    [payer] = await ethers.getSigners();
    [user, sepay, custodian, stranger, newUser, withdrawTo, other] = Array.from({ length: 7 }, wallet);
    for (const w of [user, sepay, custodian, stranger, newUser]) {
      await payer.sendTransaction({ to: w.address, value: ethers.parseEther("1") });
    }

    const singleton = await (await ethers.getContractFactory("Safe")).deploy();
    const factory = await (await ethers.getContractFactory("SafeProxyFactory")).deploy();
    const setup = singleton.interface.encodeFunctionData("setup", [
      [user.address, sepay.address, custodian.address], 2, ZERO, "0x", ZERO, ZERO, 0, ZERO,
    ]);
    const rc = await (await factory.createProxyWithNonce(await singleton.getAddress(), setup, 1)).wait();
    const proxy = rc.logs.map((l) => { try { return factory.interface.parseLog(l); } catch { return null; } })
      .find((e) => e && e.name === "ProxyCreation").args.proxy;
    safe = await ethers.getContractAt("Safe", proxy);

    usdc = await (await ethers.getContractFactory("TestUSDC")).deploy();
    await usdc.mint(proxy, 10_000n * 10n ** 6n);

    recovery = await (await ethers.getContractFactory("DelayedRecovery")).deploy();
    guard = await (await ethers.getContractFactory("SignerGuard")).deploy(await recovery.getAddress());

    // Configuración inicial: la firman el usuario y SE pay.
    await execSafe([user, sepay], await recovery.getAddress(),
      recovery.interface.encodeFunctionData("register", [user.address, sepay.address, custodian.address, withdrawTo.address]));
    await execSafe([user, sepay], proxy, safe.interface.encodeFunctionData("enableModule", [await recovery.getAddress()]));
    await execSafe([user, sepay], proxy, safe.interface.encodeFunctionData("setGuard", [await guard.getAddress()]));
  });

  const transferData = (to, amount) => usdc.interface.encodeFunctionData("transfer", [to, amount]);

  describe("SignerGuard: sin la firma del usuario no se mueve nada", function () {
    it("usuario + SE pay pueden mover fondos", async function () {
      await execSafe([user, sepay], await usdc.getAddress(), transferData(other.address, 100n));
      expect(await usdc.balanceOf(other.address)).to.equal(100n);
    });

    it("usuario + custodio pueden mover fondos (si SE pay desaparece)", async function () {
      await execSafe([user, custodian], await usdc.getAddress(), transferData(other.address, 100n));
      expect(await usdc.balanceOf(other.address)).to.equal(100n);
    });

    it("SE pay + custodio NO pueden transferir sin el usuario", async function () {
      await expect(execSafe([sepay, custodian], await usdc.getAddress(), transferData(other.address, 100n)))
        .to.be.revertedWithCustomError(guard, "MissingUserSignature");
    });

    it("SE pay + custodio NO pueden quitar el guardia ni cambiar dueños", async function () {
      await expect(execSafe([sepay, custodian], await safe.getAddress(), safe.interface.encodeFunctionData("setGuard", [ZERO])))
        .to.be.revertedWithCustomError(guard, "MissingUserSignature");
      await expect(execSafe([sepay, custodian], await safe.getAddress(),
        safe.interface.encodeFunctionData("addOwnerWithThreshold", [stranger.address, 2])))
        .to.be.revertedWithCustomError(guard, "MissingUserSignature");
    });
  });

  describe("DelayedRecovery: retiros sin el usuario, solo a su dirección y con 48 h", function () {
    it("paga a la dirección registrada después de 48 horas", async function () {
      await recovery.connect(sepay).proposeWithdrawal(await safe.getAddress(), await usdc.getAddress(), 2_000n);
      await recovery.connect(custodian).approve(0);
      await expect(recovery.execute(0)).to.be.revertedWithCustomError(recovery, "TooEarly");
      await time.increase(H48);
      await recovery.connect(stranger).execute(0);
      expect(await usdc.balanceOf(withdrawTo.address)).to.equal(2_000n);
    });

    it("el usuario puede cancelar durante la espera", async function () {
      await recovery.connect(sepay).proposeWithdrawal(await safe.getAddress(), await usdc.getAddress(), 2_000n);
      await recovery.connect(custodian).approve(0);
      await recovery.connect(user).cancel(0);
      await time.increase(H48);
      await expect(recovery.execute(0)).to.be.revertedWithCustomError(recovery, "NotOpen");
      expect(await usdc.balanceOf(withdrawTo.address)).to.equal(0n);
    });

    it("necesita la aprobación de SE pay y del custodio", async function () {
      await recovery.connect(sepay).proposeWithdrawal(await safe.getAddress(), await usdc.getAddress(), 2_000n);
      await time.increase(H48);
      await expect(recovery.execute(0)).to.be.revertedWithCustomError(recovery, "MissingApproval");
    });

    it("nadie ajeno puede proponer, aprobar ni cancelar", async function () {
      await expect(recovery.connect(stranger).proposeWithdrawal(await safe.getAddress(), await usdc.getAddress(), 1n))
        .to.be.revertedWithCustomError(recovery, "NotAuthorized");
      await recovery.connect(sepay).proposeWithdrawal(await safe.getAddress(), await usdc.getAddress(), 1n);
      await expect(recovery.connect(stranger).approve(0)).to.be.revertedWithCustomError(recovery, "NotAuthorized");
      await expect(recovery.connect(sepay).cancel(0)).to.be.revertedWithCustomError(recovery, "NotAuthorized");
    });

    it("también funciona con AVAX (moneda nativa)", async function () {
      await payer.sendTransaction({ to: await safe.getAddress(), value: ethers.parseEther("2") });
      const before = await ethers.provider.getBalance(withdrawTo.address);
      await recovery.connect(custodian).proposeWithdrawal(await safe.getAddress(), ZERO, ethers.parseEther("1"));
      await recovery.connect(sepay).approve(0);
      await time.increase(H48);
      await recovery.execute(0);
      expect(await ethers.provider.getBalance(withdrawTo.address)).to.equal(before + ethers.parseEther("1"));
    });
  });

  describe("Cambio de llave del usuario: 7 días de aviso", function () {
    it("reemplaza la llave perdida tras 7 días y la vieja deja de valer", async function () {
      await recovery.connect(sepay).proposeUserRotation(await safe.getAddress(), newUser.address);
      await recovery.connect(custodian).approve(0);
      await time.increase(H48);
      await expect(recovery.execute(0)).to.be.revertedWithCustomError(recovery, "TooEarly");
      await time.increase(D7 - H48);
      await recovery.execute(0);

      expect(await safe.isOwner(newUser.address)).to.equal(true);
      expect(await safe.isOwner(user.address)).to.equal(false);
      expect(await recovery.userOf(await safe.getAddress())).to.equal(newUser.address);

      await execSafe([newUser, sepay], await usdc.getAddress(), transferData(other.address, 5n));
      expect(await usdc.balanceOf(other.address)).to.equal(5n);
      await expect(execSafe([user, sepay], await usdc.getAddress(), transferData(other.address, 5n))).to.be.reverted;
    });
  });

  describe("Dirección de retiro: solo con la firma del usuario y 48 h", function () {
    it("se cambia con la firma del usuario y se aplica tras 48 horas", async function () {
      await execSafe([user, sepay], await recovery.getAddress(),
        recovery.interface.encodeFunctionData("requestWithdrawalAddressChange", [other.address]));
      await expect(recovery.applyWithdrawalAddressChange(await safe.getAddress())).to.be.revertedWithCustomError(recovery, "TooEarly");
      await time.increase(H48);
      await recovery.applyWithdrawalAddressChange(await safe.getAddress());
      expect((await recovery.configs(await safe.getAddress())).withdrawalTo).to.equal(other.address);
    });

    it("SE pay + custodio no pueden cambiar la dirección de retiro", async function () {
      await expect(execSafe([sepay, custodian], await recovery.getAddress(),
        recovery.interface.encodeFunctionData("requestWithdrawalAddressChange", [stranger.address])))
        .to.be.revertedWithCustomError(guard, "MissingUserSignature");
    });
  });
});
