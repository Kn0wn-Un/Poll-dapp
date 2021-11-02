var PollApp = artifacts.require('./PollApp.sol');

module.exports = function (deployer) {
	deployer.deploy(PollApp);
};
