const { ethers } = require("hardhat");
const fs = require("fs");
require('dotenv').config();
const { metadataTemplate } = require("./metadataTemplate");
const THREE_MONTHS = 7776000; // seconds
const env = process.env;

async function main() {
  //Loading accounts
  const accounts = await ethers.getSigners();
  const addresses = accounts.map((item) => item.address);

  // Loading contract factory.
  const DungeonsAndDragonsCharacter = await ethers.getContractFactory("DungeonsAndDragonsCharacter");

  const payment = env.TRUFFLE_CL_BOX_PAYMENT || "3000000000000000000"

  // const TokenTest  = await ethers.getContractFactory("TokenTest");
  // const MemberCard = await ethers.getContractFactory("MemberCard");
  // const Staking    = await ethers.getContractFactory("Staking");
  // const Vendor     = await ethers.getContractFactory("Vendor");

  // Deploy contracts
  console.log('==================================================================');
  console.log('VERIFY ADDRESS');
  console.log('==================================================================');
  
  const dnd = await DungeonsAndDragonsCharacter.deploy(
    env.RINKEBY_VRF_COORDINATOR,
    env.RINKEBY_LINKTOKEN,
    env.RINKEBY_KEYHASH
  );

  // const dnd = DungeonsAndDragonsCharacter.deploy(
  //   env.MUMBAI_VRF_COORDINATOR,
  //   env.MUMBAI_LINKTOKEN,
  //   env.MUMBAI_KEYHASH
  // );

  await dnd.deployed();

  // Nạp LINK cho chainlink
  const tokenAddress = await dnd.LinkToken();
  const token = await ethers.getContractAt("LinkTokenInterface",tokenAddress);
  console.log("Chainlink Token address: ", tokenAddress);
  // const token = await LinkTokenInterface.at(tokenAddress); // using with truffle
  console.log("Funding contract: ", dnd.address);
  await token.transfer(dnd.address, payment);

  // tạo các character 
  console.log("Creating requests on contract: ", dnd.address);
  const tx  = await dnd.requestNewRandomCharacter("The Chainlink Knight");
  const tx2 = await dnd.requestNewRandomCharacter("The Chainlink Elf");
  const tx3 = await dnd.requestNewRandomCharacter("The Chainlink Wizard");
  const tx4 = await dnd.requestNewRandomCharacter("The Chainlink Orc");

  // get ra các character
  console.log('Let\'s get the overview of your character');
  const overview = await dnd.characters(0);
  console.log(overview);

  // Tạo metadata
  // const length = await dnd.getNumberOfCharacters();
  // let index = 0;
  // while (index < length) {
  //   console.log('Let\'s get the overview of your character ' + index + ' of ' + length);
  //   let characterMetadata = metadataTemplate;
  //   let characterOverview = await dnd.characters(index);
  //   index += 1;
  //   characterMetadata['name'] = characterOverview['name'];
  //   if (fs.existsSync('metadata/' + characterMetadata['name'].toLowerCase().replace(/\s/g, '-') + '.json')) {
  //     console.log('test')
  //     continue
  //   }
  //   console.log(characterMetadata['name'])
  //   characterMetadata['attributes'][0]['value'] = characterOverview['strength']['words'][0]
  //   characterMetadata['attributes'][1]['value'] = characterOverview['dexterity']['words'][0]
  //   characterMetadata['attributes'][2]['value'] = characterOverview['constitution']['words'][0]
  //   characterMetadata['attributes'][3]['value'] = characterOverview['intelligence']['words'][0]
  //   characterMetadata['attributes'][4]['value'] = characterOverview['wisdom']['words'][0]
  //   characterMetadata['attributes'][5]['value'] = characterOverview['charisma']['words'][0]
    
  //   filename = 'metadata/' + characterMetadata['name'].toLowerCase().replace(/\s/g, '-')
  //   let data = JSON.stringify(characterMetadata)
  //   fs.writeFileSync(filename + '.json', data)

  // set tokenUri
  // const TOKENID = 0;
  // console.log('Let\'s set the tokenURI of your character')
  // const tx  = await dnd.setTokenURI(0, "")
  // console.log('tx :>> ', tx);
  // const tx1 = await dnd.setTokenURI(1, "")
  // console.log('tx1 :>> ', tx1);
  // const tx2 = await dnd.setTokenURI(2, "")
  // console.log('tx2 :>> ', tx2);
  // const tx3 = await dnd.setTokenURI(3, "")
  // console.log('tx3 :>> ', tx3);
  }

  

  // const memberCard = await MemberCard.deploy("Member Card NFT", "MCN", 3, THREE_MONTHS);
  // await memberCard.deployed();
  // console.log("MemberCard deployed to:", memberCard.address);
  // const deployedMemberCard = await memberCard.deployTransaction.wait();

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
