const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Ethpool Test Cases", function () {
  let ethpoolContract;

  beforeEach(async function () {
    const [owner] = await ethers.getSigners();
    const EthpoolContract = await ethers.getContractFactory("Ethpool");
    ethpoolContract = await EthpoolContract.deploy();
    await ethpoolContract.connect(owner).deployed();
  });

  it("Add member", async function () {
    const [owner, addr1] = await ethers.getSigners();
    await ethpoolContract.addMember(addr1.address);
    const isMember = await ethpoolContract.isMember(addr1.address);
    expect(isMember).to.equal(true);
  });

  it("Shouldn't deposit if address isn't member", async function () {
    const [owner, addr1] = await ethers.getSigners();
    await expect(ethpoolContract.connect(addr1).deposit(50)).to.be.revertedWith(
      "You aren't member of group"
    );
  });

  it("Should deposit if address is member", async function () {
    const [owner, addr1] = await ethers.getSigners();
    await ethpoolContract.addMember(addr1.address);
    await ethpoolContract.connect(addr1).deposit(50);
    const deposit = await ethpoolContract.deposits(addr1.address);
    expect(deposit).to.equal(50);
  });

  it("Takeout deposits", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();
    await ethpoolContract.addMember(addr1.address);
    await ethpoolContract.addMember(addr2.address);
    await ethpoolContract.connect(addr1).deposit(40);
    await ethpoolContract.connect(addr2).deposit(60);

    const deposit1 = await ethpoolContract.deposits(addr1.address);
    const deposit2 = await ethpoolContract.deposits(addr2.address);
    expect(deposit1).to.equal(40);
    expect(deposit2).to.equal(60);

    const takeOut1 = await ethpoolContract.connect(addr1).takeOut();
    const rc = await takeOut1.wait();
    const event = rc.events.find((event) => event.event === "takeOutEvent");
    const [total] = event.args;
    expect(total.toNumber()).to.equal(40);
  });

  it("Only a team member can to deposit rewards", async function () {
    const [owner, addr1] = await ethers.getSigners();
    await expect(
      ethpoolContract.connect(addr1).depositNewReward(50)
    ).to.be.revertedWith("You do not have permissions for this action");
  });

  it("Should deposit rewards", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();
    await ethpoolContract.addMember(addr1.address);
    await ethpoolContract.addMember(addr2.address);
    await ethpoolContract.connect(addr1).deposit(100);
    await ethpoolContract.connect(addr2).deposit(300);
    await ethpoolContract.depositNewReward(200);

    const deposit1 = await ethpoolContract.deposits(addr1.address);
    const deposit2 = await ethpoolContract.deposits(addr2.address);
    expect(deposit1).to.equal(100);
    expect(deposit2).to.equal(300);

    const rewards1 = await ethpoolContract.rewards(addr1.address);
    const rewards2 = await ethpoolContract.rewards(addr2.address);
    expect(rewards1).to.equal(50);
    expect(rewards2).to.equal(150);
  });

  it("Test case final: A deposits then T deposits then B deposits then A withdraws and finally B withdraws", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();
    await ethpoolContract.addMember(addr1.address);
    await ethpoolContract.addMember(addr2.address);

    await ethpoolContract.connect(addr1).deposit(100);
    await ethpoolContract.depositNewReward(200);

    await ethpoolContract.connect(addr2).deposit(301);

    const takeOut1 = await ethpoolContract.connect(addr1).takeOut();
    let rc = await takeOut1.wait();
    let event = rc.events.find((event) => event.event === "takeOutEvent");
    let [total] = event.args;
    expect(total.toNumber()).to.equal(300);

    const takeOut2 = await ethpoolContract.connect(addr2).takeOut();
    rc = await takeOut2.wait();
    event = rc.events.find((event) => event.event === "takeOutEvent");
    [total] = event.args;
    expect(total.toNumber()).to.equal(301);
  });
});
