import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import PollApp from '../contracts/PollApp.json';
import getWeb3 from '../getWeb3';
import Home from './Home';
import Poll from './Poll';
import MakePoll from './MakePoll';
import User from './User';
import '../styles/App.css';
import Nav from '../containers/Nav';

function App() {
	const [web3, setWeb3] = useState(null);
	const [accounts, setAccounts] = useState(null);
	const [contract, setContract] = useState(null);

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

	if (!web3) {
		return <div>Loading Web3, accounts, and contract...</div>;
	}
	return (
		<div>
			<section className="main-section">
				<Router>
					<div className="main-section-nav">
						<Nav />
					</div>
					<div className="main-section-main">
						<Switch>
							<Route
								path="/makepoll"
								render={() => (
									<MakePoll contract={contract} accounts={accounts} />
								)}
							/>
							<Route
								path="/poll"
								render={() => <Poll contract={contract} accounts={accounts} />}
							/>
							<Route
								path="/user"
								render={() => <User contract={contract} accounts={accounts} />}
							/>
							<Route
								path="/"
								render={() => <Home contract={contract} accounts={accounts} />}
							/>
						</Switch>
					</div>
				</Router>
			</section>
		</div>
	);
}

export default App;
