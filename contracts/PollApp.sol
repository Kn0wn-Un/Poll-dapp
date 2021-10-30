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
    struct Vote {
        uint256 poll;
        uint8 option;
    }

    // mapping user to votes
    // mappping poll to users
    mapping(address => Vote[]) public userVotes;
    mapping(uint256 => address[]) public pollVotes;

    // event poll created
    // event user voted
    event PollCreated(address indexed creator, uint256 pollNumber);
    event UserVoted(address indexed user, uint256 pollNumber, uint8 option);

    // modifier to check if _pollNumber is valid
    modifier pollExists(uint256 _pollNumber) {
        require(_pollNumber < pollsArray.length, "Invalid poll number");
        _;
    }

    // modifier to check if _question, _timeLimit and _options are valid
    modifier pollCheck(
        string memory _question,
        uint8 _timeLimit,
        string[] memory _options
    ) {
        require(
            keccak256(abi.encode(_question)) != keccak256(abi.encode("")),
            "Question is empty"
        );
        require(_timeLimit > 0, "Time limit cannot be less than 1 hour");
        require(_timeLimit <= 24, "Time limit cannot exceed 24 hours");
        require(_options.length != 1, "Only one option given");
        _;
    }

    // modifier to check if _optionNumber and voting time is valid
    modifier voteCheck(uint256 _pollNumber, uint8 _optionNumber) {
        Poll memory poll = pollsArray[_pollNumber];
        require(_optionNumber < poll.numberOfOptions, "Invalid option number");
        require(
            block.timestamp <= poll.timeCreated + poll.timeLimit * 1 hours,
            "Time limit exceeded"
        );
        _;
    }

    // function createPoll to create new polls and push it into pollsArray
    function createPoll(
        string memory _question,
        uint8 _timeLimit,
        uint8 _numberOfOptions,
        string[] memory _options
    ) public pollCheck(_question, _timeLimit, _options) {
        if (_options.length != _numberOfOptions) {
            _numberOfOptions = uint8(_options.length);
        }
        Poll memory poll;
        poll.question = _question;
        poll.creator = msg.sender;
        poll.timeLimit = _timeLimit;
        poll.numberOfOptions = _numberOfOptions;
        poll.options = _options;
        poll.timeCreated = block.timestamp;
        uint256[] memory tempArray = new uint256[](_numberOfOptions);
        poll.votes = tempArray;
        pollsArray.push(poll);
        emit PollCreated(msg.sender, pollsArray.length - 1);
    }

    // function vote to allow user to vote in a poll
    function vote(uint256 _pollNumber, uint8 _optionNumber)
        public
        pollExists(_pollNumber)
        voteCheck(_pollNumber, _optionNumber)
    {
        for (uint256 i = 0; i < pollVotes[_pollNumber].length; i++) {
            if (pollVotes[_pollNumber][i] == msg.sender)
                revert("Already voted");
        }
        Poll storage poll = pollsArray[_pollNumber];
        poll.votes[_optionNumber]++;
        userVotes[msg.sender].push(Vote(_pollNumber, _optionNumber));
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
        pollExists(_pollNumber)
        returns (uint256[] memory votes)
    {
        votes = pollsArray[_pollNumber].votes;
    }

    // function getUserVotes returns all votes made by the user
    function getUserVotes(address _userAddress)
        public
        view
        returns (Vote[] memory votes)
    {
        votes = userVotes[_userAddress];
    }

    // function getPollVotedUsers returns all users who voted in poll _pollnumber
    function getPollVotedUsers(uint256 _pollNumber)
        public
        view
        pollExists(_pollNumber)
        returns (address[] memory users)
    {
        users = pollVotes[_pollNumber];
    }

    // function getUserPollVote returns the vote choice of the user _userAddress for the poll _pollNumber
    function getUserPollVote(uint256 _pollNumber, address _userAddress)
        public
        view
        pollExists(_pollNumber)
        returns (Vote memory userVote)
    {
        Vote[] memory votes = userVotes[_userAddress];
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
