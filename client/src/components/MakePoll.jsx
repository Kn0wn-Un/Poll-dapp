import React, { useEffect, useState } from 'react';
import '../styles/makepoll.css';
function MakePoll(props) {
	const [question, setQuestion] = useState('');
	const [noOfOptions, setNoOfOptions] = useState(2);
	const [options, setOptions] = useState([]);
	const [timeLimit, setTimeLimit] = useState(1);
	const [option1, setOption1] = useState('');
	const [option2, setOption2] = useState('');
	const [option3, setOption3] = useState('');
	const [option4, setOption4] = useState('');
	const [option5, setOption5] = useState('');
	const [allowButton, setAllowButton] = useState(false);

	const makePoll = async () => {
		await props.contract.methods
			.createPoll(question, timeLimit, noOfOptions, options)
			.send({ from: props.accounts[0] });
	};

	const optionHandler = (i, val) => {
		switch (i) {
			case 0:
				setOption1(val);
				break;
			case 1:
				setOption2(val);
				break;
			case 2:
				setOption3(val);
				break;
			case 3:
				setOption4(val);
				break;
			case 4:
				setOption5(val);
				break;
			default:
				return;
		}
		setOptions([...Array(noOfOptions)].map((_, i) => optionValue(i)));
	};
	const optionValue = (i) => {
		switch (i) {
			case 0:
				return option1;
			case 1:
				return option2;
			case 2:
				return option3;
			case 3:
				return option4;
			case 4:
				return option5;
			default:
				return;
		}
	};

	const makeOptionsInput = (_, i) => {
		return (
			<div className="make-poll-options-input" key={i}>
				<div className="make-poll-input-head">
					Option {i + 1}:
					<input
						type="text"
						value={optionValue(i)}
						onChange={(e) => {
							optionHandler(i, e.target.value);
						}}
						maxLength={30}
						required
					></input>
				</div>
			</div>
		);
	};

	const validateInputs = () => {
		if (
			question &&
			noOfOptions >= 2 &&
			noOfOptions <= 5 &&
			timeLimit >= 1 &&
			timeLimit <= 24
		) {
			for (let i = 0; i < noOfOptions; i++) {
				if (!optionValue(i)) {
					setAllowButton(false);
					return;
				}
			}
			setAllowButton(true);
			return;
		}
		setAllowButton(false);
	};

	useEffect(() => {
		validateInputs();
	}, [
		question,
		timeLimit,
		noOfOptions,
		option1,
		option2,
		option3,
		option4,
		option5,
	]);

	return (
		<section className="make-poll-section">
			<div className="page-heading">Make Poll</div>
			<div className="make-poll-tips">
				Hey there, something to keep in mind, longer the question and/or options
				more the gas fees...
			</div>
			<div className="make-poll-input-section">
				<div className="make-poll-input-sub">
					<div className="make-poll-input-head">
						Question:
						<input
							type="text"
							value={question}
							onChange={(e) => {
								setQuestion(e.target.value);
							}}
							maxLength={69}
							required
						></input>
					</div>
					<div className="make-poll-input-instruction">
						<div>Maximum 69 characters</div>
						<div></div>
					</div>
				</div>
				<div className="make-poll-input-sub">
					<div className="make-poll-input-head">
						Time Limit:
						<input
							type="number"
							value={timeLimit}
							onChange={(e) => {
								setTimeLimit(e.target.value);
							}}
							max={24}
							min={1}
							required
						></input>
					</div>
					<div className="make-poll-input-instruction">
						<div>1 - 24 hours</div>
					</div>
				</div>
				<div className="make-poll-input-sub">
					<div className="make-poll-input-head">
						Enter Number of Options:
						<input
							type="number"
							value={noOfOptions}
							onChange={(e) => {
								const num = Number(e.target.value, 10);
								if (num >= 2 && num <= 5) {
									setNoOfOptions(num);
								}
							}}
							max={5}
							min={2}
							required
						></input>
					</div>
					<div className="make-poll-input-instruction">
						<div>Maximum 5 options</div>
					</div>
				</div>
				{noOfOptions ? (
					<div className="make-poll-input-sub">
						<div className="make-poll-input-head">Enter Options:</div>
						{[...Array(noOfOptions)].map((s, i) => makeOptionsInput(s, i))}
						<div className="make-poll-input-instruction">
							<div>Maximum 30 characters</div>
						</div>
					</div>
				) : (
					<></>
				)}
				<div className="make-poll-input-sub">
					<div className="make-poll-btn-div">
						<button
							className="make-poll-btn"
							onClick={makePoll}
							disabled={!allowButton}
						>
							Make Poll
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}

export default MakePoll;
