const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CRXToken", function () {
  let crx;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const CRXToken = await ethers.getContractFactory("CRXToken");
    crx = await CRXToken.connect(owner).deploy();
  });

  describe("Deployment", function () {
    it("should set the right name and symbol", async function () {
      expect(await crx.name()).to.equal("CryOS Token");
      expect(await crx.symbol()).to.equal("CRX");
    });
  });

  describe("Minting", function () {
    it("should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await crx.mint(addr1.address, mintAmount);
      
      expect(await crx.balanceOf(addr1.address)).to.equal(mintAmount);
      expect(await crx.totalSupply()).to.equal(mintAmount);
    });

    it("should reject non-owner from minting", async function () {
      const mintAmount = ethers.parseEther("1000");
      await expect(
        crx.connect(addr1).mint(addr1.address, mintAmount)
      ).to.be.reverted;
    });
  });

  describe("Burning", function () {
    it("should allow users to burn their tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await crx.mint(owner.address, mintAmount);
      
      const burnAmount = ethers.parseEther("500");
      await crx.burn(burnAmount);
      
      expect(await crx.balanceOf(owner.address)).to.equal(mintAmount - burnAmount);
    });
  });

  describe("Transfers", function () {
    it("should transfer tokens between accounts", async function () {
      await crx.mint(owner.address, ethers.parseEther("1000"));
      await crx.transfer(addr1.address, ethers.parseEther("100"));
      
      expect(await crx.balanceOf(addr1.address)).to.equal(ethers.parseEther("100"));
      expect(await crx.balanceOf(owner.address)).to.equal(ethers.parseEther("900"));
    });
  });
});