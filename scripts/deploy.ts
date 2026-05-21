import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy CRXToken (will need to mint initial supply separately)
  const CRXToken = await ethers.getContractFactory("CRXToken");
  const crx = await CRXToken.deploy();

  console.log("CRXToken deployed to:", await crx.getAddress());

  // Mint initial supply to deployer (21M * 10^18)
  // Note: In production, this should go to a timelock/treasury contract
  const supply = ethers.parseEther("21000000");
  await crx.mint(deployer.address, supply);
  console.log("Minted", supply.toString(), "CRX to deployer");

  // Initial allocations based on tokenomics
  const allocations = {
    ecosystem: ethers.parseEther("7350000"),    // 35%
    development: ethers.parseEther("4200000"),   // 20%
    community: ethers.parseEther("3150000"),     // 15%
  };

  console.log("\n=== Initial Distribution ===");
  console.log("Total Supply:", supply.toString());
  console.log("Ecosystem (35%):", allocations.ecosystem.toString());
  console.log("Development (20%):", allocations.development.toString());
  console.log("Community (15%):", allocations.community.toString());

  console.log("\nDeployment complete!");
  
  return {
    crx: await crx.getAddress(),
  };
}

main()
  .then((result) => {
    console.log(result);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });