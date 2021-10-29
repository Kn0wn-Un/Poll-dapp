const PollApp = artifacts.require('PollApp');

contract('PollApp', (accounts) => {
	let pollApp;
	beforeEach(async function () {
		// Deploy a new contract for each test
		pollApp = await PollApp.new();
	});
	describe('createPoll(_question, _timeLimit, _numberOfOptions, _options)', function () {
		it('...should revert if question is empty', async () => {
			try {
				await pollApp.createPoll('', 1, 2, ['yes', 'no'], {
					from: accounts[0],
				});
			} catch (error) {
				assert.equal(error.reason, 'Question is empty');
			}
		});
		it('...should revert if time limit is > 24 hours', async () => {
			try {
				await pollApp.createPoll('Question?', 78, 2, ['yes', 'no'], {
					from: accounts[0],
				});
			} catch (error) {
				assert.equal(error.reason, 'Time limit cannot exceed 24 hours');
			}
		});
		it('...should revert if time limit is < 1 hour', async () => {
			try {
				await pollApp.createPoll('Question?', 0, 2, ['yes', 'no'], {
					from: accounts[0],
				});
			} catch (error) {
				assert.equal(error.reason, 'Time limit cannot be less than 1 hour');
			}
		});
		it('...should revert if only 1 option is given', async () => {
			try {
				await pollApp.createPoll('Question?', 23, 1, ['yes'], {
					from: accounts[0],
				});
			} catch (error) {
				assert.equal(error.reason, 'Only one option given');
			}
		});
		describe('valid arguments are given', () => {
			it('...should create a poll', async () => {
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
			it('...should emit PollCreated event', async () => {
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
});
