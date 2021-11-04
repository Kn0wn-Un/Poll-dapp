import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home(props) {
	const [res, setRes] = useState(0);

	const getPolls = async () => {
		const response = await props.contract.methods.getAllPolls().call();
		setRes(response);
	};

	useEffect(() => {
		if (props.contract) {
			props.contract.events
				.PollCreated()
				.on('data', function (event) {
					getPolls();
					console.log(event);
				})
				.on('error', console.error);
			getPolls();
		}
	});

	if (!res) {
		return (
			<div>
				<h1>Getting Polls...</h1>
			</div>
		);
	}

	return (
		<div className="App">
			<h1>Home</h1>
			<div>Total Polls: {res.length}</div>
			<Link to="/poll">Poll</Link>
			<br />
			<Link to="/makepoll">Make Poll!</Link>
		</div>
	);
}

export default Home;
