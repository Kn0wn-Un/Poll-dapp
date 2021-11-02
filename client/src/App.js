import React, { useState, useEffect } from 'react';
// import SimpleStorageContract from './contracts/SimpleStorage.json';
import PollApp from './contracts/PollApp.json';
import getWeb3 from './getWeb3';

import './App.css';

function App() {
	const [res, setRes] = useState(0);
	const [web3, setWeb3] = useState(null);
	const [accounts, setAccounts] = useState(null);
	const [contract, setContract] = useState(null);

	const getPolls = async () => {
		// Stores a given value, 5 by default.
		const response = await contract.methods.getAllPolls().call();

		// Update state with the result.
		setRes(response);
	};

	const makePoll = async () => {
		// Stores a given value, 5 by default.
		await contract.methods
			.createPoll('Question?', 1, 2, ['yes', 'no'])
			.send({ from: accounts[0] });
	};

	useEffect(() => {
		(async () => {
			try {
				// Get network provider and web3 instance.
				const w3 = await getWeb3();

				// Use web3 to get the user's accounts.
				const acc = await w3.eth.getAccounts();

				// Get the contract instance.
				const networkId = await w3.eth.net.getId();
				const deployedNetwork = PollApp.networks[networkId];
				const instance = new w3.eth.Contract(
					PollApp.abi,
					deployedNetwork && deployedNetwork.address
				);

				// Set web3, accounts, and contract to the state, and then proceed with an
				// example of interacting with the contract's methods.
				setWeb3(w3);
				setAccounts(acc);
				setContract(instance);
			} catch (error) {
				// Catch any errors for any of the above operations.
				alert(
					`Failed to load web3, accounts, or contract. Check console for details.`
				);
				console.error(error);
			}
		})();
	});
	useEffect(() => {
		if (contract) {
			contract.events
				.PollCreated()
				.on('data', function (event) {
					getPolls();
					console.log(event);
				})
				.on('error', console.error);
			getPolls();
		}
	}, [contract]);

	if (!web3) {
		return <div>Loading Web3, accounts, and contract...</div>;
	}
	return (
		<div className="App">
			<h1>Good to Go!</h1>
			<p>Your Truffle Box is installed and ready.</p>
			<h2>Smart Contract Example</h2>
			<p>
				If your contracts compiled and migrated successfully, below will show a
				stored value of 69 (by default).
			</p>
			<p>
				Try changing the value stored on <strong>line 42</strong> of App.js.
			</p>
			<div>The array is of length: {res.length}</div>
			<button onClick={makePoll}>Make Poll!</button>
		</div>
	);
}

export default App;
