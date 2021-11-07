import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';
function User(props) {
	const [res, setRes] = useState([]);

	const getPolls = async () => {
		const pollsIdArr = await props.contract.methods
			.getUserPolls(props.accounts[0])
			.call();
		const pollsArr = await props.contract.methods.getAllPolls().call();
		const userPolls = [];
		for (let i = 0; i < pollsIdArr.length; i++) {
			userPolls.push(pollsArr[Number(pollsIdArr[i], 10)]);
		}
		setRes(userPolls);
		console.log(userPolls);
	};

	const listPolls = (poll) => {
		console.log(poll);
		let totalVotes = 0;
		for (let i = 0; i < poll.votes.length; i++) {
			totalVotes += Number(poll.votes[i], 10);
		}

		return (
			<Link to={`/poll/${poll.id}`}>
				<div className="home-poll-div" key={poll.id}>
					<div className="home-poll-div-qbox">
						<div className="home-poll-div-q-details">
							<span>(Poll ID: {Number(poll.id, 10)})</span>
						</div>
						<div className="home-poll-div-question">{poll.question}</div>
						<div>{totalVotes} votes</div>
					</div>
				</div>
			</Link>
		);
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
	}, [props.contract]);

	if (!res) {
		return (
			<div>
				<h1>Getting Polls...</h1>
			</div>
		);
	}

	return (
		<section className="home-section">
			<div className="page-heading">My Polls</div>
			<div>
				{res.length ? (
					res.map((p) => listPolls(p))
				) : (
					<div className="home-error">No Polls available :(</div>
				)}
			</div>
		</section>
	);
}

export default User;
