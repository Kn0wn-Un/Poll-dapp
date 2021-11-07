import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { RadioGroup, RadioButton } from 'react-radio-buttons';
import '../styles/home.css';
import '../styles/poll.css';
function Poll(props) {
	const { pollid } = useParams();
	const [res, setRes] = useState(null);
	const [timeLeft, setTimeLeft] = useState(0);
	const [totalVotes, setTotalVotes] = useState(0);
	const [timeCreated, setTimeCreated] = useState(0);
	const [expired, setExpired] = useState(false);
	const [isCreator, setIsCreator] = useState(false);
	const [hasVoted, setHasVoted] = useState(false);
	const [votedOption, setVotedOption] = useState(-1);
	const [option, setOption] = useState(-1);

	const getPoll = async () => {
		try {
			let response = await props.contract.methods.getAllPolls().call();
			setRes(response[pollid]);
			console.log(response[pollid]);
			response = await props.contract.methods
				.getUserVotes(props.accounts[0])
				.call();
			for (let i = 0; i < response.length; i++) {
				if (response[i][0] === pollid.toString()) {
					setHasVoted(true);
					setVotedOption(response[i][1]);
				}
			}
			console.log(response);
		} catch (error) {
			console.log(error);
		}
	};

	const voteHandler = async () => {
		if (option < 0) {
			return;
		}
		await props.contract.methods
			.vote(pollid, option)
			.send({ from: props.accounts[0] });
	};

	useEffect(() => {
		if (props.contract && props.accounts) {
			getPoll();
		}
	}, [props.contract, props.accounts]);

	useEffect(() => {
		if (res) {
			let timeLeft = (Number(res.endTime, 10) - Date.now() / 1000) / 3600;
			if (timeLeft <= 0) {
				setExpired(true);
			} else if (timeLeft < 1) {
				setTimeLeft(Math.round(60 * timeLeft) + ' mins');
			} else {
				setTimeLeft(Math.round(timeLeft) + ' hrs');
			}

			let timeCreated =
				(Date.now() / 1000 - Number(res.timeCreated, 10)) / 3600;
			if (timeCreated < 1) {
				setTimeCreated(Math.round(60 * timeCreated) + ' mins');
			} else {
				setTimeCreated(Math.round(timeCreated) + ' hrs');
			}
			let totalVotes = 0;
			for (let i = 0; i < res.votes.length; i++) {
				totalVotes += Number(res.votes[i], 10);
			}
			setTotalVotes(totalVotes);
			if (props.accounts[0] === res.creator) {
				setIsCreator(true);
			}
		}
	}, [res]);

	if (!res) {
		return (
			<div>
				<div className="page-heading">Poll{res ? ': ' + res.question : ''}</div>
				<div>Getting Poll...</div>
			</div>
		);
	}
	return (
		<div>
			<div className="page-heading">Poll{res ? ': ' + res.question : ''}</div>
			<div>
				<div className="home-poll-div">
					<div className="home-poll-div-qbox">
						<div className="home-poll-div-q-details">
							<span>Created by {isCreator ? 'you' : res.creator} </span>
							<span>{timeCreated} ago </span>
							<span>(Poll ID: {Number(res.id, 10)})</span>
						</div>
						<div className="home-poll-div-question">{res.question}</div>
						<div className="poll-vote-div">
							<div className="poll-options">
								<RadioGroup
									onChange={(e) => {
										setOption(e);
									}}
								>
									{res.options.map((o, i) => {
										return (
											<RadioButton
												value={i.toString()}
												key={i}
												disabled={hasVoted || isCreator || expired}
											>
												{o}
											</RadioButton>
										);
									})}
								</RadioGroup>
							</div>
							<div className="poll-vote-btn-div">
								{hasVoted ? (
									<div>You have already voted for option {votedOption}!</div>
								) : (
									<button
										className="poll-vote-btn"
										onClick={voteHandler}
										disabled={option < 0 || isCreator || expired}
									>
										Vote!
									</button>
								)}
							</div>
						</div>
						<div>
							<span>{totalVotes} votes • </span>
							{expired ? <span>Time Over</span> : <span>{timeLeft} left</span>}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Poll;
