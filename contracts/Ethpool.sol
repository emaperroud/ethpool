//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IEthpool.sol";
import "hardhat/console.sol";

contract Ethpool is IEthpool, AccessControl {
  bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

  constructor() {
    _setupRole(ADMIN_ROLE, msg.sender);
  }

  uint256 private depositsTotalAmount;
  address[] private members;
  mapping(address => bool) public isMember;
  mapping(address => uint256) public deposits;
  mapping(address => uint256) public rewards;

  modifier isAdmin() {
    require(
      hasRole(ADMIN_ROLE, msg.sender) == true,
      "You do not have permissions for this action"
    );
    _;
  }

  modifier addressIsMember() {
    require(isMember[msg.sender] == true, "You aren't member of group");
    _;
  }

  event takeOutEvent(uint256 total);

  function balanceOf(address addr) public view returns (uint256) {
    return (deposits[addr] + rewards[addr]);
  }

  function getDepositsTotalAmount() public view returns (uint256) {
    return depositsTotalAmount;
  }

  function addMember(address addrs) external override {
    isMember[addrs] = true;
    members.push(addrs);
  }

  function deposit(uint256 amount) external payable override addressIsMember {
    depositsTotalAmount = depositsTotalAmount + amount;
    deposits[msg.sender] = deposits[msg.sender] + amount;
  }

  function depositNewReward(uint256 amount) external payable override isAdmin {
    for (uint256 i = 0; i < members.length; i++) {
      address addr = members[i];
      uint256 porcentage = (deposits[addr] * 100) / depositsTotalAmount;
      rewards[addr] = rewards[addr] + ((porcentage * amount) / 100);
    }
  }

  function takeOut() external override addressIsMember {
    uint256 total = (deposits[msg.sender] + rewards[msg.sender]);
    rewards[msg.sender] = 0;
    deposits[msg.sender] = 0;
    emit takeOutEvent(total);
  }

  receive() external payable {}

  fallback() external payable {}
}
