// var SimpleStorage = artifacts.require('./SimpleStorage.sol');
var PollApp = artifacts.require('./PollApp.sol');

module.exports = function (deployer) {
	deployer.deploy(PollApp);
};
