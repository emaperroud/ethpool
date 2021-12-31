const hre = require("hardhat");

async function main() {
  const Ethpool = await hre.ethers.getContractFactory("Ethpool");
  const ethpool = await Ethpool.deploy();

  await ethpool.deployed();

  console.log("Ethpool deployed to:", ethpool.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
