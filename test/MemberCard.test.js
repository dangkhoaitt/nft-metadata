const { ethers } = require("hardhat");
const { expect } = require("chai");
const { skipTime } = require("./utils");
const { memberCardTemplate } = require("../metadata/template/MemberCardTemplate");
const fs = require('fs');


const THREE_MONTHS = 7776000; // seconds
const FEE = "50000000000000000";

describe("MemberCard", () => {
  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    admin = accounts[0];
    user1 = accounts[1];
    user2 = accounts[2];
    user3 = accounts[3];
    user4 = accounts[4];

    MemberCard = await ethers.getContractFactory("MemberCard");
    Vendor     = await ethers.getContractFactory("Vendor");

    memberCard = await MemberCard.deploy("Member Card NFT", "MCN", 3, THREE_MONTHS);
    vendor1    = await Vendor.deploy(memberCard.address);
    vendor2    = await Vendor.deploy(memberCard.address);

    await memberCard.addVendor(vendor1.address);
  });

  describe("Deployment 1 : Check basic info", () => {
    it("Check name", async () => {
      let name = await memberCard.name();
      expect(name).to.equal("Member Card NFT");
    });

    it("Check Token URI", async () => {
      await memberCard.connect(admin).setTokenExpiry(1);
      await memberCard.connect(admin).setTokenExpiry(2);
      await memberCard.connect(user1).mintToken(user1.address, "Member God", { value: FEE });
      await memberCard.connect(user2).mintToken(user2.address, "Member Sliver", { value: FEE });

      let uri1 = await memberCard.tokenURI(1);
      let uri2 = await memberCard.tokenURI(2);
      expect(uri1).to.equal("");
      expect(uri2).to.equal("");
    });

    it("Set duration", async () => {
      await memberCard.setExpiryDate(THREE_MONTHS + 100);
      expect(await memberCard.cardDuration()).to.equal("7776100");
      await expect(
        memberCard.setExpiryDate(THREE_MONTHS + 100)
      ).to.be.revertedWith("Must different");
    });

    it("Set count for a card", async () => {
      await memberCard.connect(user1).mintToken(user1.address, { value: FEE });
      await memberCard.connect(admin).setTokenExpiry(1);
      await vendor1.connect(user1).useMemberCard(1);
      expect(await memberCard.getAvailCount(1)).to.equal(2);

      await memberCard.setAvailCountFor(1, 10);
      expect(await memberCard.getAvailCount(1)).to.equal("10");
    });

    it("Set count", async () => {
      await memberCard.setAvailCount(10);
      expect(await memberCard.countOfUse()).to.equal("10");
      await expect(memberCard.setAvailCount(10)).to.be.revertedWith("Must different");
    });

    it("Check data mint", async () => {
      let balanceB = await ethers.provider.getBalance(user1.address);
      let txData = await memberCard.connect(user1).mintToken(user1.address, { value: FEE });
      let txNormal = await ethers.provider.getTransaction(txData.hash);

      //check balance
      let gasUse = (await txData.wait()).gasUsed;
      let txFee = gasUse.mul(txNormal.gasPrice);
      let balanceA = await ethers.provider.getBalance(user1.address);

      expect(balanceB.sub(txFee.add(balanceA))).to.equal("50000000000000000");

      let uri1 = await memberCard.tokenURI(1);
      expect(uri1).to.equal("");
    });

    it("Check only have 1 NFT per wallet", async () => {
      // If user1 already has 1 NFT, can not mint the second one
      await memberCard.connect(user1).mintToken(user1.address, { value: FEE });
      let data = await memberCard.tokensOfOwner(user1.address);
      expect(data.length).to.equal(1);
      expect(data[0]).to.equal(1);

      await expect(
        memberCard.connect(user1).mintToken(user1.address, { value: FEE })
      ).to.be.revertedWith("Only have 1 NFT per wallet");

      // If user2 already has 1 NFT, user2 can not receive NFTs more
      await memberCard.connect(user2).mintToken(user2.address, { value: FEE });
      data = await memberCard.tokensOfOwner(user2.address);
      expect(data.length).to.equal(1);
      expect(data[0]).to.equal(2);
      await expect(
        memberCard.connect(user1).transferFrom(user1.address, user2.address, 1)
      ).to.be.revertedWith("Only have 1 NFT per wallet");
    });

    it("Check Owner", async () => {
      await memberCard.connect(user1).mintToken(user1.address, { value: FEE });
      let ownerOf1 = await memberCard.ownerOf(1);
      expect(ownerOf1).to.equal(user1.address);
    });

    it("add and remove Vendor", async () => {
      await expect(
        memberCard.connect(user1).addVendor(vendor2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      expect(await memberCard.vendors(vendor2.address)).to.be.false;
      await memberCard.addVendor(vendor2.address);
      expect(await memberCard.vendors(vendor2.address)).to.be.true;
      await memberCard.removeVendor(vendor2.address);
      expect(await memberCard.vendors(vendor2.address)).to.be.false;
    });
  });

  describe("Deployment 2: Mint token", () => {

    it("Check expiry empty after minted when admin not set yet", async () => {
      await memberCard.connect(user1).mintToken(user1.address, { value: FEE });
      await expect(memberCard.connect(user2).getExpiryDate(1)).to.be.empty;
    });

    it("Check not owner use", async () => {
      await memberCard.connect(user1).mintToken(user1.address, { value: FEE });
      await memberCard.connect(admin).setTokenExpiry(1);
      await expect(vendor1.connect(user2).useMemberCard(1)).to.be.revertedWith("Not owner");
    });

    it("Check owner use 4 times ", async () => {
      await memberCard.connect(user1).mintToken(user1.address, { value: FEE });
      await memberCard.connect(admin).setTokenExpiry(1);

      await vendor1.connect(user1).useMemberCard(1);
      let useInfo = await memberCard.getuseTokenInfo(1);
      expect(useInfo.length).to.be.equal(1);
      expect(useInfo[0].vendor).to.be.equal(vendor1.address);
      expect(useInfo[0].owner).to.be.equal(user1.address);
      expect(useInfo[0].usedAt > 0).to.be.true;

      await vendor1.connect(user1).useMemberCard(1);
      useInfo = await memberCard.getuseTokenInfo(1);
      expect(useInfo.length).to.be.equal(2);
      expect(useInfo[1].vendor).to.be.equal(vendor1.address);
      expect(useInfo[1].owner).to.be.equal(user1.address);
      expect(useInfo[1].usedAt > 0).to.be.true;

      await memberCard.addVendor(vendor2.address);
      await vendor2.connect(user1).useMemberCard(1);
      useInfo = await memberCard.getuseTokenInfo(1);
      expect(useInfo.length).to.be.equal(3);
      expect(useInfo[2].vendor).to.be.equal(vendor2.address);
      expect(useInfo[2].owner).to.be.equal(user1.address);
      expect(useInfo[2].usedAt > 0).to.be.true;

      expect(await memberCard.getAvailCount(1)).to.equal(0);
      await expect(vendor1.connect(user1).useMemberCard(1)).to.be.revertedWith("Out of use");
    });

    it("Check owner use when expried", async () => {
      await memberCard.connect(user1).mintToken(user1.address, { value: FEE });
      await memberCard.connect(admin).setTokenExpiry(1);
      await vendor1.connect(user1).useMemberCard(1);
      await skipTime(THREE_MONTHS);
      await expect(vendor1.connect(user1).useMemberCard(1)).to.be.revertedWith("Expired");
    });

  });

  describe("Deployment 3 : Use token", () => {

    it("Check use when admin not set expiry yet", async () => {
      await memberCard.connect(user1).mintToken(user1.address, { value: FEE });
      await expect(vendor1.connect(user1).useMemberCard(1)).to.be.revertedWith("Expired");
    });

    it("Check invalid vendor", async () => {
      await memberCard.connect(user1).mintToken(user1.address, { value: FEE });
      await memberCard.connect(admin).setTokenExpiry(1);
      await expect(vendor2.connect(user1).useMemberCard(1)).to.be.revertedWith("Invalid vendor");
    });

    it("Check Balance User", async () => {
      let balanceB1 = await ethers.provider.getBalance(user1.address);
      let balanceB2 = await ethers.provider.getBalance(user2.address);

      let txData1 = await memberCard.connect(user1).mintToken(user1.address, { value: FEE });
      let txData2 = await memberCard.connect(user2).mintToken(user2.address, { value: FEE });

      await memberCard.connect(admin).setTokenExpiry(1);
      await memberCard.connect(admin).setTokenExpiry(2);
      await memberCard.connect(admin).setTokenExpiry(3);

      let txNormal1 = await ethers.provider.getTransaction(txData1.hash);
      let txNormal2 = await ethers.provider.getTransaction(txData2.hash);

      //check balance user 1
      let gasUse = (await txData1.wait()).gasUsed;
      let txFee = gasUse.mul(txNormal1.gasPrice);

      let balanceA1 = await ethers.provider.getBalance(user1.address);
      expect(balanceB1.sub(txFee.add(balanceA1))).to.equal("50000000000000000");

      //check balance user 2
      gasUse = (await txData2.wait()).gasUsed;
      txFee = gasUse.mul(txNormal2.gasPrice);

      let balanceA2 = await ethers.provider.getBalance(user2.address);
      expect(balanceB2.sub(txFee.add(balanceA2))).to.equal("50000000000000000");

      await vendor1.connect(user1).useMemberCard(1);
      await vendor1.connect(user2).useMemberCard(2);
      expect(await memberCard.getAvailCount(1)).to.equal(2);
      expect(await memberCard.getAvailCount(2)).to.equal(2);

      let balanceB3 = await ethers.provider.getBalance(user3.address);

      let txData3 = await memberCard.connect(user3).mintToken(user3.address, { value: FEE });
      expect(await memberCard.getAvailCount(3)).to.equal(3);

      let txNormal3 = await ethers.provider.getTransaction(txData3.hash);

      // check balance user 1
      gasUse = (await txData3.wait()).gasUsed;
      txFee = gasUse.mul(txNormal3.gasPrice);

      let balanceA3 = await ethers.provider.getBalance(user3.address);
      expect(balanceB3.sub(txFee.add(balanceA3))).to.equal("50000000000000000");

      await vendor1.connect(user3).useMemberCard(3);
      expect(await memberCard.getAvailCount(1)).to.equal(2);
      expect(await memberCard.getAvailCount(2)).to.equal(2);
      expect(await memberCard.getAvailCount(3)).to.equal(2);
    });


  });

  describe.only("Deployment 4 : Add Metadata", () => {
    beforeEach(async () => {
      await memberCard.connect(admin).setTokenExpiry(1);
      await memberCard.connect(admin).setTokenExpiry(2);
      await memberCard.connect(user1).mintToken(user1.address, "Member Gold", { value: FEE });
      await memberCard.connect(user2).mintToken(user2.address, "Member Sliver", { value: FEE });
      await memberCard.connect(user3).mintToken(user3.address, "Member Platinum", { value: FEE });
      await memberCard.connect(user4).mintToken(user4.address, "Member Diamond", { value: FEE });
    })

    it("Generate Metadata", async() => {
      const memberCards = (await memberCard.connect(user1).getNumberOfMemberCards()).toString();
      index = 0
      while (index < memberCards) {
        console.log('Let\'s get the overview of your memberCard ' + index + ' of ' + memberCards)
        let memberCardMetadata = memberCardTemplate;
        let memberCardOverview = await memberCard.memberCards(index);
        index++
        memberCardMetadata['name'] = memberCardOverview
        if (fs.existsSync('metadata/' + memberCardMetadata['name'].toLowerCase().replace(/\s/g, '-') + '.json')) {
            console.log('test')
            continue
        }
        console.log(memberCardMetadata['name'])
        filename = 'metadata/' + memberCardMetadata['name'].toLowerCase().replace(/\s/g, '-')
        let data = JSON.stringify(memberCardMetadata)
        fs.writeFileSync(filename + '.json', data)
      }
    })

    it("Set TokenURI", async() => {
      await memberCard.connect(user1).setTokenURI(1, "https://ipfs.io/ipfs/QmRP8idwGTB53yg76Czqa6EEReQ8e38vPNPfjPTupadkRP?filename=member-gold.json")
      await memberCard.connect(user2).setTokenURI(2, "https://ipfs.io/ipfs/QmXd61Wuj4mhNKHtdKgseZkcTzaTSSbBxYN5F7aaFEpCqx?filename=member-sliver.json")
      await memberCard.connect(user3).setTokenURI(3, "https://ipfs.io/ipfs/QmVob6MAQFdMJ5dCyFuWSoEZcKzLFg92h2oQ6v7qQH5jRS?filename=member-platinum.json")
      await memberCard.connect(user4).setTokenURI(4, "https://ipfs.io/ipfs/QmZVNNuAQ47sGJeiqWUKxC38YTwEQ5g618YHeu8URrmdeW?filename=member-diamond.json")

      const uri1 = await memberCard.connect(user1).getTokenURI(1);
      console.log('uri1 :>> ', uri1);
    })

    // it("Get TokenURI", async () => {
    //   const uri1 = await memberCard.connect(user1).getTokenURI(1);
    //   console.log('uri1 :>> ', uri1);
    // })

  });

  describe("setPause", () => {
    it("Allows transfer success", async () => {
      await memberCard.connect(user1).mintToken(user1.address, { value: FEE });
      
      const balanceCurrentUser1 = await memberCard.connect(user1).balanceOf(user1.address);
      expect(balanceCurrentUser1).to.equal(1)

      const balanceCurrentUser2 = await memberCard.connect(user1).balanceOf(user2.address);
      expect(balanceCurrentUser2).to.equal(0)

      await memberCard.connect(user1).transferFrom(user1.address, user2.address, 1)

      const balanceAfterTransferUser1 = await memberCard.connect(user1).balanceOf(user1.address);
      expect(balanceAfterTransferUser1).to.equal(0)

      const balanceAfterTransferUser2 = await memberCard.connect(user1).balanceOf(user2.address);
      expect(balanceAfterTransferUser2).to.equal(1)
    });

    it("Transfer not allows", async () => {
      await memberCard.connect(admin).setPaused(true);
      await memberCard.connect(user1).mintToken(user1.address, { value: FEE });
      const token = await memberCard.connect(user1).tokenByIndex(0);
      await memberCard.connect(user1).approve(admin.address, token)
      await expect(memberCard.transferFrom(user1.address, user2.address, token)).to.be.revertedWith("Pausable: paused")
    });
  })
});
