const hre = require("hardhat");
const fs = require("fs");
const text = fs.readFileSync("scripts/contracts.json", "utf8");
const contractAddress = JSON.parse(text);
const { THREE_MONTHS } = require("./deploy");

async function main() {
  await hre.run("verify:verify", {
    address: contractAddress.memberCard,
    constructorArguments: ["Member Card NFT", "MCN", 3, THREE_MONTHS],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
