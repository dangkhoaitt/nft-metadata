const { ethers } = require("hardhat");
const fs = require("fs");
const { memberCardTemplate } = require("../metadata/template/MemberCardTemplate");
require('dotenv').config();
const THREE_MONTHS = 7776000; // seconds
const FEE = "50000000000000000";
const env = process.env;

async function main() {
  //Loading accounts
  const accounts = await ethers.getSigners();
  const addresses = accounts.map((item) => item.address.toString());
  
  // Loading contract factory.
  // const TokenTest  = await ethers.getContractFactory("TokenTest");
  const MemberCard = await ethers.getContractFactory("MemberCard");
  // const Staking    = await ethers.getContractFactory("Staking");
  // const Vendor     = await ethers.getContractFactory("Vendor");

  // Deploy contracts
  console.log('==================================================================');
  console.log('VERIFY ADDRESS');
  console.log('==================================================================');
  
  const memberCard = await MemberCard.deploy("Member Card NFT", "MCN", 3, THREE_MONTHS);
  await memberCard.deployed();
  console.log("MemberCard  deployed to ==> ", memberCard.address);

  // get ra các character
  // console.log('Let\'s get the overview of your character');
  // const overview = await dnd.characters(0);
  // console.log(overview);

  // Mint token
  await memberCard.mintToken(addresses[0], { value: FEE });

  // Tạo metadata
  // const memberCardLength = (await memberCard.getNumberOfMemberCards()).toString();
  // let index = 0;
  // while (index < memberCardLength) {
  //   console.log('Let\'s get the overview of your MemberCard ' + index + ' of ' + memberCardLength);
  //   let memberCardMetadata = memberCardTemplate;
  //   let memberCardOverview = await memberCard.memberCards(index);
  //   index += 1;
  //   memberCardMetadata['name'] = memberCardOverview;
  //   if (fs.existsSync('metadata/' + memberCardMetadata['name'].toLowerCase().replace(/\s/g, '-') + '.json')) {
  //     console.log('test')
  //     continue
  //   }
  //   console.log(memberCardMetadata['name'])
  //   filename = 'metadata/' + characterMetadata['name'].toLowerCase().replace(/\s/g, '-')
  //   let data = JSON.stringify(characterMetadata)
  //   fs.writeFileSync(filename + '.json', data)
  // }
  // 0x0B592f7bb85E4f516019eeeb372414Ca16F83535
  // 0xdE20a2B89387EB22364FaEAeA3774CB4B5F0a00c
  
  // set tokenUri
  console.log('Let\'s set the tokenURI of your MemberCard')
  // const tx  = await memberCard.setTokenURI(0, "https://ipfs.io/ipfs/QmTxYCTADGbWBw1oByLC4aDpQoKS6zDtSq2WmoLkCeRZtb?filename=member-kv3d.json")
  // const tx1 = await memberCard.setTokenURI(1, "https://ipfs.io/ipfs/QmXd61Wuj4mhNKHtdKgseZkcTzaTSSbBxYN5F7aaFEpCqx?filename=member-sliver.json")
  // const tx2 = await memberCard.setTokenURI(2, "https://ipfs.io/ipfs/QmVob6MAQFdMJ5dCyFuWSoEZcKzLFg92h2oQ6v7qQH5jRS?filename=member-platinum.json")
  // const tx3 = await memberCard.setTokenURI(3, "https://ipfs.io/ipfs/QmZVNNuAQ47sGJeiqWUKxC38YTwEQ5g618YHeu8URrmdeW?filename=member-diamond.json")
  }

  // const vendor = await Vendor.deploy(deployedMemberCard.contractAddress);
  // await vendor.deployed();
  // console.log("Vendor     deployed to:", vendor.address);
  // const deployedVendor = await vendor.deployTransaction.wait();

  // const tokenTest = await TokenTest.deploy("TGE Token", "TGE");
  // await tokenTest.deployed();
  // console.log("TokenTest  deployed to:", tokenTest.address);
  // const deployedToken = await tokenTest.deployTransaction.wait();

  // const staking = await Staking.deploy(deployedToken.contractAddress, deployedMemberCard.contractAddress);
  // await staking.deployed();
  // console.log("Staking    deployed to:", staking.address);
  // const deployedStaking = await staking.deployTransaction.wait();

  console.log('==================================================================');
  console.log('CONTRACT ADDRESS');
  console.log('==================================================================');

  // console.log("MemberCard :", deployedMemberCard.contractAddress);
  // console.log("Vendor     :", deployedVendor.contractAddress);
  // console.log("TokenTest  :", deployedToken.contractAddress);
  // console.log("Staking    :", deployedStaking.contractAddress);

  // await tokenTest.setStakeContract(deployedStaking.contractAddress);
  // await memberCard.addVendor(deployedVendor.contractAddress);
  // await memberCard.setPaused(true);

  // const contractAddresses = {
  //   memberCard: deployedMemberCard.contractAddress,
  //   vendor: deployedVendor.contractAddress,
  //   tokenTest: deployedToken.contractAddress,
  //   staking: deployedStaking.contractAddress,
  // };

  // await fs.writeFileSync(
  //   "scripts/contracts.json",
  //   JSON.stringify(contractAddresses)
  // );
// }

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
