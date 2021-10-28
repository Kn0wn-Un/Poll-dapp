// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract PollApp {
    // poll structure
    struct Poll {
        address creator;
        string question;
        string[] options;
        uint8 numberOfOptions;
        uint8 timeLimit;
        uint256 timeCreated;
        uint256[] votes;
    }

    // dynamic polls array containing all the polls
    Poll[] public pollsArray;

    // user vote data structure
    struct UserVote {
        uint256 poll;
        uint8 option;
    }

    // mapping user to votes
    // mappping poll to users
    mapping(address => UserVote[]) public userVotes;
    mapping(uint256 => address[]) public pollVotes;

    // event poll created
    // event user voted
    event PollCreated(address indexed creator, uint256 pollNumber);
    event UserVoted(address indexed user, uint256 pollNumber, uint8 option);

    // function createPoll to create new polls and push it into pollsArray
    function createPoll(
        string memory _question,
        uint8 _time,
        uint8 _numberOfOptions,
        string[] memory _options
    ) public {
        require(
            keccak256(abi.encode(_question)) != keccak256(abi.encode("")),
            "Question is empty"
        );
        require(_time <= 24, "Time cannot exceed 24 hours");
        require(_options.length != 1, "Only one option given");
        if (_options.length != _numberOfOptions) {
            _numberOfOptions = uint8(_options.length);
        }
        Poll memory poll;
        poll.question = _question;
        poll.creator = msg.sender;
        poll.timeLimit = _time;
        poll.numberOfOptions = _numberOfOptions;
        poll.options = _options;
        poll.timeCreated = block.timestamp;
        uint256[] memory tempArray = new uint256[](_numberOfOptions);
        poll.votes = tempArray;
        pollsArray.push(poll);
        emit PollCreated(msg.sender, pollsArray.length - 1);
    }

    // function vote to allow user to vote in a poll
    function vote(uint256 _pollNumber, uint8 _optionNumber) public {
        require(_pollNumber < pollsArray.length, "Invalid poll number");
        require(
            _optionNumber < pollsArray[_pollNumber].numberOfOptions,
            "Invalid option number"
        );
        require(
            block.timestamp <=
                pollsArray[_pollNumber].timeCreated +
                    pollsArray[_pollNumber].timeLimit *
                    1 hours,
            "Time limit exceeded"
        );
        for (uint256 i = 0; i < pollVotes[_pollNumber].length; i++) {
            if (pollVotes[_pollNumber][i] == msg.sender)
                revert("Already voted");
        }
        Poll storage poll = pollsArray[_pollNumber];
        poll.votes[_optionNumber]++;
        userVotes[msg.sender].push(UserVote(_pollNumber, _optionNumber));
        pollVotes[_pollNumber].push(msg.sender);
        emit UserVoted(msg.sender, _pollNumber, _optionNumber);
    }

    // function getAllPolls returns the whole pollsArray
    function getAllPolls() public view returns (Poll[] memory) {
        return pollsArray;
    }

    // function getVotes returns votes of poll _pollNumber
    function getVotes(uint256 _pollNumber)
        public
        view
        returns (uint256[] memory votes)
    {
        require(_pollNumber < pollsArray.length, "Invalid poll number");
        votes = pollsArray[_pollNumber].votes;
    }

    // function getUserVotes returns all votes made by the user
    function getUserVotes(address _userAddress)
        public
        view
        returns (UserVote[] memory votes)
    {
        votes = userVotes[_userAddress];
    }

    // function getPollVotedUsers returns all users who voted in poll _pollnumber
    function getPollVotedUsers(uint256 _pollNumber)
        public
        view
        returns (address[] memory users)
    {
        require(_pollNumber < pollsArray.length, "Invalid poll number");
        users = pollVotes[_pollNumber];
    }

    // function getUserPollVote returns the vote choice of the user _userAddress for the poll _pollNumber
    function getUserPollVote(uint256 _pollNumber, address _userAddress)
        public
        view
        returns (UserVote memory userVote)
    {
        require(_pollNumber < pollsArray.length, "Invalid poll number");
        UserVote[] memory votes = userVotes[_userAddress];
        bool hasVoted = false;
        for (uint256 i = 0; i < votes.length; i++) {
            if (votes[i].poll == _pollNumber) {
                hasVoted = true;
                userVote = votes[i];
            }
        }
        if (!hasVoted) {
            revert("Not Voted");
        }
    }
}
