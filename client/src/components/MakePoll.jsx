import React from 'react';
import { Link } from 'react-router-dom';

function MakePoll(props) {
	const makePoll = async () => {
		// Stores a given value, 5 by default.
		await props.contract.methods
			.createPoll('Question?', 1, 2, ['yes', 'no'])
			.send({ from: props.accounts[0] });
	};

	return (
		<div className="App">
			<h1>Make Poll</h1>
			<button onClick={makePoll}>Make Poll</button>
			<Link to="/poll">Poll</Link>
			<br />
			<Link to="/home">Home</Link>
		</div>
	);
}

export default MakePoll;
