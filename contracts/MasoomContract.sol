// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.4.17;
// pragma experimental ABIEncoderV2;

contract MasoomContract {
    address public owner;
    uint candidateCount;

    uint voterCount;

    bool start;
    bool end;

    // Constructor
    function MasoomContract() public {
        owner = msg.sender;
        candidateCount = 0;
        voterCount = 0;
        start = false;
        end = false;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    // Only Admin can access
    modifier onlyAdmin() {
        require(msg.sender == owner);
        _;
    }

    struct Candidate {
        uint voteCount;
        uint candidateId;
        address[] voterAddresses;
    }

    mapping(uint => Candidate) public candidateDetails;

    // Only admin can add candidate
    function addCandidate(uint _candidateId) public onlyAdmin {
        Candidate memory newCandidate = Candidate({
            voteCount: 0,
            candidateId: _candidateId,
            voterAddresses: new address[](100) // as empty dynamic array
        });

        candidateDetails[_candidateId] = newCandidate;
        candidateCount += 1;
    }

    // get total number of candidates
    function getCandidateNumber() public view returns (uint) {
        return candidateCount;
    }

    struct Voter {
        address voterAddress;
        uint voterId;
        bool hasVoted;
        bool isVerified;
    }

    address[] public voters;
    mapping(address => Voter) public voterDetails;
    mapping(uint => Voter) public voterIdMapping;

    // Get specific voter details by voterId
    function getVoterById(
        uint _voterId
    )
        public
        view
        returns (address voterAddress, bool hasVoted, bool isVerified)
    {
        Voter memory voter = voterIdMapping[_voterId];
        return (voter.voterAddress, voter.hasVoted, voter.isVerified);
    }

    // request to be added as voter
    function requestVoter(uint _voterId) public {
        Voter memory newVoter = Voter({
            voterAddress: msg.sender,
            voterId: _voterId,
            hasVoted: false,
            isVerified: false
        });

        voterDetails[msg.sender] = newVoter;
        voterIdMapping[_voterId] = newVoter;
        voters.push(msg.sender);
        voterCount += 1;
    }

    // get total number of voters
    function getVoterCount() public view returns (uint) {
        return voterCount;
    }
    // get total number of voters
    function getVoters() public view returns (address[] memory) {
        return voters;
    }

    function verifyVoter(uint _voterId) public onlyAdmin {
        voterIdMapping[_voterId].isVerified = true;
        voterDetails[voterIdMapping[_voterId].voterAddress].isVerified = true;
    }

    function vote(uint candidateId) public {
        require(voterDetails[msg.sender].hasVoted == false);
        require(voterDetails[msg.sender].isVerified == true);
        require(start == true);
        require(end == false);

        candidateDetails[candidateId].voteCount += 1;
        candidateDetails[candidateId].voterAddresses.push(msg.sender);
        voterDetails[msg.sender].hasVoted = true;
        voterIdMapping[voterDetails[msg.sender].voterId].hasVoted = true;
    }

    function startElection() public onlyAdmin {
        start = true;
        end = false;
    }

    function endElection() public onlyAdmin {
        end = true;
        start = false;
    }

    function getStart() public view returns (bool) {
        return start;
    }

    function getEnd() public view returns (bool) {
        return end;
    }
}
