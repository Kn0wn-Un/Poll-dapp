// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract PollApp {
    struct Poll {
        string question;
        string[] options;
        address creator;
        uint8 numberOfOptions;
        uint8 time;
        uint256[] votes;
        bool showCount;
    }

    Poll[] public pollsArray;

    struct UserVote {
        uint256 poll;
        uint8 option;
    }

    mapping(address => UserVote[]) public userVotes;
    mapping(uint256 => address[]) public pollVotes;

    // events

    function createPoll(
        string memory _question,
        uint8 _time,
        bool _showCount,
        uint8 _numberOfOptions,
        string[] memory _options
    ) public {
        require(
            keccak256(abi.encode(_question)) != keccak256(abi.encode("")),
            "Question is empty"
        );
        require(_time <= 24, "Time cannot exceed 24 hours");
        require(
            _options.length == _numberOfOptions,
            "Options list not equal to number of options"
        );
        Poll memory poll;
        poll.question = _question;
        poll.creator = msg.sender;
        poll.time = _time;
        poll.showCount = _showCount;
        poll.numberOfOptions = _numberOfOptions;
        poll.options = _options;
        uint256[] memory tempArray = new uint256[](_numberOfOptions);
        poll.votes = tempArray;
        pollsArray.push(poll);
    }

    function vote(uint256 _pollNumber, uint8 _optionNumber) public {
        require(_pollNumber < pollsArray.length, "Invalid poll number");
        require(
            _optionNumber < pollsArray[_pollNumber].numberOfOptions,
            "Invalid option number"
        );
        for (uint256 i = 0; i < pollVotes[_pollNumber].length; i++) {
            if (pollVotes[_pollNumber][i] == msg.sender)
                revert("already voted");
        }
        Poll storage poll = pollsArray[_pollNumber];
        poll.votes[_optionNumber]++;
        userVotes[msg.sender].push(UserVote(_pollNumber, _optionNumber));
        pollVotes[_pollNumber].push(msg.sender);
    }

    function getAllPolls() public view returns (Poll[] memory) {
        return pollsArray;
    }

    function getVotes(uint256 _pollNumber)
        public
        view
        returns (uint256[] memory votes)
    {
        votes = pollsArray[_pollNumber].votes;
    }

    function getUserVotes(address _userAddress)
        public
        view
        returns (UserVote[] memory votes)
    {
        votes = userVotes[_userAddress];
    }

    function getPollVotedUsers(uint256 _pollNumber)
        public
        view
        returns (address[] memory users)
    {
        users = pollVotes[_pollNumber];
    }
}
