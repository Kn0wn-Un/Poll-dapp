import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Poll(props) {
	const [voted, setVoted] = useState(false);
	const vote = async () => {
		// Stores a given value, 5 by default.
		await props.contract.methods.vote(0, 0).send({ from: props.accounts[0] });
		setVoted(true);
	};

	return (
		<div className="App">
			<div className="page-heading">Poll</div>
			<button onClick={vote} disabled={voted}>
				Vote
			</button>
			{voted ? <div>VOTED!</div> : <></>}
			<Link to="/makepoll">Make Poll!</Link>
			<br />
			<Link to="/home">Home</Link>
		</div>
	);
}

export default Poll;
