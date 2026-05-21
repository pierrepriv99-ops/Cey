/**
 * CryOS Mainnet Deployment Script
 * 
 * Deploys:
 * - CRX Token to Ethereum mainnet
 * - CryoStore marketplace
 */

const { ethers } = require("hardhat");

const CONFIG = {
  // Ethereum Mainnet
  ethereum: {
    chainId: 1,
    crxToken: "0x0000000000000000000000000000000000000000",  // To be set after deploy
    cryoStore: "0x0000000000000000000000000000000000000000",
  }
};

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("═══════════════════════════════════════");
  console.log("  CryOS Mainnet Deployment");
  console.log("═══════════════════════════════════════");
  console.log("Deployer:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  
  // 1. Deploy CRX Token
  console.log("\n[1/2] Deploying CRX Token...");
  const CRXToken = await ethers.getContractFactory("CRXToken");
  const crx = await CRXToken.deploy();
  await crx.waitForDeployment();
  const crxAddress = await crx.getAddress();
  console.log("✓ CRX Token:", crxAddress);
  
  // 2. Mint initial supply
  console.log("\n[2/2] Minting initial supply...");
  const initialSupply = ethers.parseEther("21000000");
  await crx.mint(deployer.address, initialSupply);
  console.log("✓ Minted:", ethers.formatEther(initialSupply), "CRX");
  
  // 3. Deploy CryoStore
  console.log("\n[Bonus] Deploying CryoStore...");
  const CryoStore = await ethers.getContractFactory("CryoStore");
  const store = await CryoStore.deploy();
  await store.waitForDeployment();
  const storeAddress = await store.getAddress();
  console.log("✓ CryoStore:", storeAddress);
  
  // Summary
  console.log("\n═══════════════════════════════════════");
  console.log("  Deployment Complete!");
  console.log("═══════════════════════════════════════");
  console.log("CRX Token:", crxAddress);
  console.log("CryoStore:", storeAddress);
  console.log("Total Supply: 21,000,000 CRX");
  
  // Save addresses for frontend
  const results = {
    network: "ethereum",
    chainId: 1,
    contracts: {
      CRXToken: crxAddress,
      CryoStore: storeAddress
    },
    timestamp: new Date().toISOString()
  };
  
  console.log("\nAddresses (JSON):", JSON.stringify(results, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });