const PollApp = artifacts.require('PollApp');

contract('PollApp', (accounts) => {
	let pollApp;
	beforeEach(async function () {
		// Deploy a new contract for each test
		pollApp = await PollApp.new();
	});
	describe('createPoll(_question, _timeLimit, _numberOfOptions, _options)', function () {
		it('should revert if question is empty', async () => {
			try {
				await pollApp.createPoll('', 1, 2, ['yes', 'no'], {
					from: accounts[0],
				});
			} catch (error) {
				assert.equal(error.reason, 'Question is empty');
			}
		});
		it('should revert if time limit is > 24 hours', async () => {
			try {
				await pollApp.createPoll('Question?', 78, 2, ['yes', 'no'], {
					from: accounts[0],
				});
			} catch (error) {
				assert.equal(error.reason, 'Time limit cannot exceed 24 hours');
			}
		});
		it('should revert if time limit is < 1 hour', async () => {
			try {
				await pollApp.createPoll('Question?', 0, 2, ['yes', 'no'], {
					from: accounts[0],
				});
			} catch (error) {
				assert.equal(error.reason, 'Time limit cannot be less than 1 hour');
			}
		});
		it('should revert if only 1 option is given', async () => {
			try {
				await pollApp.createPoll('Question?', 23, 1, ['yes'], {
					from: accounts[0],
				});
			} catch (error) {
				assert.equal(error.reason, 'Only one option given');
			}
		});
		describe('valid arguments are given', () => {
			it('should create a poll', async () => {
				const results = await pollApp.createPoll(
					'Question?',
					23,
					1,
					['yes', 'no'],
					{
						from: accounts[0],
					}
				);
				expect(results.receipt.status, true);
			});
			it('should emit PollCreated event', async () => {
				const results = await pollApp.createPoll(
					'Question?',
					23,
					1,
					['yes', 'no'],
					{
						from: accounts[0],
					}
				);
				assert(results.logs[0].event, 'PollCreated');
			});
		});
	});

	beforeEach(async function () {
		// Deploy a new contract for each test
		pollApp = await PollApp.new();
		await pollApp.createPoll('question?', 1, 2, ['yes', 'no'], {
			from: accounts[0],
		});
	});

	describe('vote(_pollNumber, _optionNumber)', function () {
		it('should revert if poll does not exists', async () => {
			try {
				await pollApp.vote(1, 0);
			} catch (error) {
				assert.equal(error.reason, 'Invalid poll number');
			}
		});
		it('should revert if time limit has exceeded', async () => {
			await web3.currentProvider.send(
				{
					jsonrpc: '2.0',
					method: 'evm_increaseTime',
					params: [1 * 60 * 60],
					id: 0,
				},
				() => {}
			);
			await web3.currentProvider.send(
				{
					jsonrpc: '2.0',
					method: 'evm_mine',
					params: [],
					id: 0,
				},
				() => {}
			);
			try {
				await pollApp.vote(0, 1);
			} catch (error) {
				assert.equal(error.reason, 'Time limit exceeded');
			}
		});
		describe('invalid option number is given', () => {
			it('should revert if poll option -ve', async () => {
				try {
					await pollApp.vote(0, -1);
				} catch (error) {
					assert.equal(error.reason, 'value out-of-bounds');
				}
			});
			it('should revert if poll option is greater than number of options', async () => {
				try {
					await pollApp.vote(0, 2);
				} catch (error) {
					assert.equal(error.reason, 'Invalid option number');
				}
			});
		});
		describe('valid arguments are given', () => {
			it('should vote', async () => {
				const results = await pollApp.vote(0, 0);
				expect(results.receipt.status, true);
			});
			it('should emit UserVoted event', async () => {
				const results = await pollApp.vote(0, 0);
				assert(results.logs[0].event, 'UserVoted');
			});
		});
		it('should revert user has already voted', async () => {
			await pollApp.vote(0, 0, {
				from: accounts[2],
			});
			try {
				await pollApp.vote(0, 0, {
					from: accounts[2],
				});
			} catch (error) {
				assert.equal(error.reason, 'Already voted');
			}
		});
	});
	describe('getAllPolls()', function () {
		it('should return polls array', async () => {
			await pollApp.createPoll('question two ?', 1, 1, ['yes', 'no'], {
				from: accounts[1],
			});
			const result = await pollApp.getAllPolls();
			expect(Object.keys(result).length).to.equal(2);
			expect(result[1].creator).to.equal(accounts[1]);
			expect(result[1].question).to.equal('question two ?');
			expect(result[1].options).to.eql(['yes', 'no']);
			expect(Number(result[1].numberOfOptions, 10)).to.equal(2);
			expect(Number(result[1].timeLimit, 10)).to.equal(1);
			expect(result[1].votes).to.eql(['0', '0']);
			expect(Number(result[1].timeCreated, 10)).to.be.below(Date.now());
		});
	});
	describe('getVotes(_pollNumber)', function () {
		it('should revert if poll does not exists', async () => {
			try {
				await pollApp.getVotes(1);
			} catch (error) {
				assert.equal(
					Object.values(error.data)[0].reason || error.reason,
					'Invalid poll number'
				);
			}
		});
		it('should return poll results', async () => {
			let result = await pollApp.getVotes(0);
			expect(result).to.not.be.undefined;
			expect(Number(result[0].toString(), 10)).to.equal(0);
			expect(Number(result[1].toString(), 10)).to.equal(0);
			await pollApp.vote(0, 1);
			await pollApp.vote(0, 1, { from: accounts[2] });
			result = await pollApp.getVotes(0);
			expect(result).to.not.be.undefined;
			expect(Number(result[0].toString(), 10)).to.equal(0);
			expect(Number(result[1].toString(), 10)).to.equal(2);
		});
	});
	describe('getUserVotes(_userAddress)', function () {
		it('should return voted users', async () => {
			let result = await pollApp.getUserVotes(accounts[0]);
			expect(result).to.not.be.undefined;
			expect(result).to.have.lengthOf(0);
			await pollApp.vote(0, 1);
			result = await pollApp.getUserVotes(accounts[0]);
			expect(result).to.not.be.undefined;
			expect(result).to.have.lengthOf(1);
			expect(result[0]).to.have.property('poll', '0');
			expect(result[0]).to.have.property('option', '1');
		});
	});
	describe('getPollVotedUsers(_pollNumber)', function () {
		it('should revert if poll does not exists', async () => {
			try {
				await pollApp.getPollVotedUsers(1);
			} catch (error) {
				assert.equal(
					Object.values(error.data)[0].reason || error.reason,
					'Invalid poll number'
				);
			}
		});
		it('should return voted users', async () => {
			await pollApp.vote(0, 1);
			let result = await pollApp.getPollVotedUsers(0);
			expect(result).to.not.be.undefined;
			expect(result).to.have.lengthOf(1);
			expect(result[0]).to.be.equal(accounts[0]);
			await pollApp.vote(0, 1, { from: accounts[2] });
			await pollApp.vote(0, 0, { from: accounts[5] });
			result = await pollApp.getPollVotedUsers(0);
			expect(result).to.not.be.undefined;
			expect(result).to.have.lengthOf(3);
			expect(result[0]).to.be.equal(accounts[0]);
			expect(result[1]).to.be.equal(accounts[2]);
			expect(result[2]).to.be.equal(accounts[5]);
		});
	});
	describe('getUserPollVote(_pollNumber, _userAddress)', function () {
		it('should revert if poll does not exists', async () => {
			try {
				await pollApp.getUserPollVote(1, accounts[0]);
			} catch (error) {
				assert.equal(
					Object.values(error.data)[0].reason || error.reason,
					'Invalid poll number'
				);
			}
		});
		it('should revert if user has not voted', async () => {
			try {
				await pollApp.getUserPollVote(0, accounts[0]);
			} catch (error) {
				assert.equal(
					Object.values(error.data)[0].reason || error.reason,
					'Not Voted'
				);
			}
		});
		it('should return option user voted for', async () => {
			await pollApp.vote(0, 1);
			let result = await pollApp.getUserPollVote(0, accounts[0]);
			expect(result).to.not.be.undefined;
			expect(result).to.have.lengthOf(2);
			expect(result).to.have.property('poll', '0');
			expect(result).to.have.property('option', '1');
		});
	});
});
