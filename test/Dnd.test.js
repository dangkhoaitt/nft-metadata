const { ethers } = require("hardhat");
const { expect } = require("chai");
require("dotenv").config();
const env = process.env;
const payment = env.TRUFFLE_CL_BOX_PAYMENT || "3000000000000000000";
const MAX_INT    = "115792089237316195423570985008687907853269984665640564039457584007913129639935";


describe("DungeonsAndDragonsCharacter", () => {
    beforeEach(async () => {
      const accounts = await ethers.getSigners();
      admin = accounts[0];
      user1 = accounts[1];
      user2 = accounts[2];
      user3 = accounts[3];
      user4 = accounts[4];

      const DungeonsAndDragonsCharacter = await ethers.getContractFactory("DungeonsAndDragonsCharacter");
      
      dnd = await DungeonsAndDragonsCharacter.deploy(
        env.RINKEBY_VRF_COORDINATOR,
        env.RINKEBY_LINKTOKEN,
        env.RINKEBY_KEYHASH
      );

      const MockLink = await ethers.getContractFactory("MockLink");
      const linkToken = await MockLink.deploy();

      const VRFCoordinatorMock = await ethers.getContractFactory("VRFCoordinatorMock")
      const vrfCoordinatorMock = await VRFCoordinatorMock.deploy(linkToken.address)

    //   tokenAddress = await dnd.LinkToken();
      // token = await ethers.getContractAt("LinkTokenInterface", tokenAddress);
    //   await tokenTest.transfer(dnd.address, payment);
    });

    describe("create characters", () => {
        // it.only("create not fund LINK token", async () => {
        //     // console.log("Creating requests on contract: ", dnd.address);
        //     await dnd.connect(user1).requestNewRandomCharacter(123);
        //     // const tx2 = await dnd.connect(user1).requestNewRandomCharacter("The Chainlink Elf");
        //     // const tx3 = await dnd.connect(user1).requestNewRandomCharacter("The Chainlink Wizard");
        //     // const tx4 = await dnd.connect(user1).requestNewRandomCharacter("The Chainlink Orc");
        // });

        it("fund LINK token", async () => {
            // await token.transfer(dnd.address, payment);
            console.log("Creating requests on contract: ", dnd.address);
            const tx  = await dnd.connect(user1).requestNewRandomCharacter("The Chainlink Knight");
            const tx2 = await dnd.connect(user1).requestNewRandomCharacter("The Chainlink Elf");
            const tx3 = await dnd.connect(user1).requestNewRandomCharacter("The Chainlink Wizard");
            const tx4 = await dnd.connect(user1).requestNewRandomCharacter("The Chainlink Orc");
        });
    })
}) 