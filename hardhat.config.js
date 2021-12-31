require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("@nomiclabs/hardhat-ethers");

if (!process.env.PRIVATE_KEYS || !process.env.ETHERSCAN_API_KEY)
  return "Please set up the env file accordingly";

const privateKeys = process.env.PRIVATE_KEYS.split(",");
const polygonScanKey = process.env.ETHERSCAN_API_KEY;

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("deposits", "Prints the total amount of all deposits", async () => {
  const address = process.env.CONTRACT_DEPLOYED;
  const EthpoolContract = await ethers.getContractFactory("Ethpool");
  const ethpoolContract = await EthpoolContract.attach(address);

  const deposits = await ethpoolContract.getDepositsTotalAmount();
  console.log("Hello, World!", deposits.toNumber());
});

module.exports = {
  solidity: "0.8.0",
  networks: {
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/ad3247a8212a49c997ebeae1f9aa912e",
      accounts: privateKeys,
    },
  },
  etherscan: {
    apiKey: polygonScanKey,
  },
};
