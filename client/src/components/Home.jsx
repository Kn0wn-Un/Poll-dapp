import React, { useState, useEffect } from 'react';
import '../styles/home.css';
function Home(props) {
	const [res, setRes] = useState([]);

	const getPolls = async () => {
		const response = await props.contract.methods.getAllPolls().call();
		setRes(response);
		console.log(response);
	};

	const listPolls = (poll) => {
		let timeLeft = (Number(poll.endTime, 10) - Date.now() / 1000) / 3600;
		if (timeLeft <= 0) {
			return;
		} else if (timeLeft < 1) {
			timeLeft = Math.round(60 * timeLeft) + ' mins';
		} else {
			timeLeft = Math.round(timeLeft) + ' hrs';
		}

		let timeCreated = (Date.now() / 1000 - Number(poll.timeCreated, 10)) / 3600;
		if (timeCreated < 1) {
			timeCreated = Math.round(60 * timeCreated) + ' mins';
		} else {
			timeCreated = Math.round(timeLeft) + ' hrs';
		}

		let totalVotes = 0;
		for (let i = 0; i < poll.votes.length; i++) {
			totalVotes += Number(poll.votes[i], 10);
		}

		return (
			<div className="home-poll-div" key={poll.id}>
				<div className="home-poll-div-qbox">
					<div className="home-poll-div-q-details">
						<span>Created by {poll.creator} </span>
						<span>{timeCreated} ago </span>
						<span>(Poll ID: {Number(poll.id, 10) + 1})</span>
					</div>
					<div className="home-poll-div-question">{poll.question}</div>
					<div>
						<span>{totalVotes} votes • </span>
						<span>{timeLeft} left</span>
					</div>
				</div>
			</div>
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
			<div className="page-heading">Home</div>
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

export default Home;
