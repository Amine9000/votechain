var MasoomContract = artifacts.require("./MasoomContract.sol");

module.exports = function(deployer) {
  deployer.deploy(MasoomContract);
};
