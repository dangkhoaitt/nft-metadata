const hre = require("hardhat");
const fs = require("fs");
const ethers = hre.ethers;
const THREE_MONTHS = 7776000; // seconds

async function main() {
  //Loading accounts
  const accounts = await ethers.getSigners();
  const addresses = accounts.map((item) => item.address);

  // Loading contract factory.
  const TokenTest  = await ethers.getContractFactory("TokenTest");
  const MemberCard = await ethers.getContractFactory("MemberCard");
  const Staking    = await ethers.getContractFactory("Staking");
  const Vendor     = await ethers.getContractFactory("Vendor");

  // Deploy contracts
  console.log('==================================================================');
  console.log('VERIFY ADDRESS');
  console.log('==================================================================');

  const memberCard = await MemberCard.deploy("Member Card NFT", "MCN", 3, THREE_MONTHS);
  await memberCard.deployed();
  console.log("MemberCard deployed to:", memberCard.address);
  const deployedMemberCard = await memberCard.deployTransaction.wait();

  const vendor = await Vendor.deploy(deployedMemberCard.contractAddress);
  await vendor.deployed();
  console.log("Vendor     deployed to:", vendor.address);
  const deployedVendor = await vendor.deployTransaction.wait();

  const tokenTest = await TokenTest.deploy("TGE Token", "TGE");
  await tokenTest.deployed();
  console.log("TokenTest  deployed to:", tokenTest.address);
  const deployedToken = await tokenTest.deployTransaction.wait();

  const staking = await Staking.deploy(deployedToken.contractAddress, deployedMemberCard.contractAddress);
  await staking.deployed();
  console.log("Staking    deployed to:", staking.address);
  const deployedStaking = await staking.deployTransaction.wait();

  console.log('==================================================================');
  console.log('CONTRACT ADDRESS');
  console.log('==================================================================');

  console.log("MemberCard :", deployedMemberCard.contractAddress);
  console.log("Vendor     :", deployedVendor.contractAddress);
  console.log("TokenTest  :", deployedToken.contractAddress);
  console.log("Staking    :", deployedStaking.contractAddress);

  await tokenTest.setStakeContract(deployedStaking.contractAddress);
  await memberCard.addVendor(deployedVendor.contractAddress);
  await memberCard.setPaused(true);

  const contractAddresses = {
    memberCard: deployedMemberCard.contractAddress,
    vendor: deployedVendor.contractAddress,
    tokenTest: deployedToken.contractAddress,
    staking: deployedStaking.contractAddress,
  };

  await fs.writeFileSync(
    "scripts/contracts.json",
    JSON.stringify(contractAddresses)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});

module.exports = {
  THREE_MONTHS
};