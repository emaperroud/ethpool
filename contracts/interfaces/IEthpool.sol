//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IEthpool {
  function addMember(address addrs) external;

  function deposit(uint256 amount) external payable;

  function depositNewReward(uint256 amount) external payable;

  function takeOut() external;
}
