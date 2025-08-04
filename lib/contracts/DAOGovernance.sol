// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./EduToken.sol";

contract EduVisionDAO is AccessControl, ReentrancyGuard {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    EduToken public eduToken;

    enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Queued,
        Expired,
        Executed
    }

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool canceled;
        bool executed;
        mapping(address => bool) hasVoted;
        mapping(address => uint8) votes; // 0 = against, 1 = for, 2 = abstain
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    
    uint256 public constant VOTING_DELAY = 1 days;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant PROPOSAL_THRESHOLD = 1000 * 10**18; // 1000 EDU tokens
    uint256 public constant QUORUM_PERCENTAGE = 10; // 10% of total supply

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string description,
        uint256 startTime,
        uint256 endTime
    );

    event VoteCast(
        address indexed voter,
        uint256 indexed proposalId,
        uint8 support,
        uint256 weight,
        string reason
    );

    event ProposalCanceled(uint256 indexed proposalId);
    event ProposalExecuted(uint256 indexed proposalId);

    constructor(address _eduToken) {
        eduToken = EduToken(_eduToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, msg.sender);
        _grantRole(EXECUTOR_ROLE, msg.sender);
    }

    function createProposal(string memory description, uint256 votingPeriod) 
        external 
        returns (uint256) 
    {
        require(
            eduToken.balanceOf(msg.sender) >= PROPOSAL_THRESHOLD,
            "Insufficient tokens to create proposal"
        );

        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.description = description;
        proposal.startTime = block.timestamp + VOTING_DELAY;
        proposal.endTime = proposal.startTime + votingPeriod;

        emit ProposalCreated(
            proposalId,
            msg.sender,
            description,
            proposal.startTime,
            proposal.endTime
        );

        return proposalId;
    }

    function castVote(uint256 proposalId, uint8 support, string memory reason) 
        external 
        nonReentrant 
    {
        require(support <= 2, "Invalid vote type");
        require(!proposals[proposalId].hasVoted[msg.sender], "Already voted");
        require(state(proposalId) == ProposalState.Active, "Voting not active");

        uint256 weight = eduToken.balanceOf(msg.sender);
        require(weight > 0, "No voting power");

        Proposal storage proposal = proposals[proposalId];
        proposal.hasVoted[msg.sender] = true;
        proposal.votes[msg.sender] = support;

        if (support == 0) {
            proposal.againstVotes += weight;
        } else if (support == 1) {
            proposal.forVotes += weight;
        } else {
            proposal.abstainVotes += weight;
        }

        emit VoteCast(msg.sender, proposalId, support, weight, reason);
    }

    function state(uint256 proposalId) public view returns (ProposalState) {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.canceled) {
            return ProposalState.Canceled;
        } else if (proposal.executed) {
            return ProposalState.Executed;
        } else if (block.timestamp <= proposal.startTime) {
            return ProposalState.Pending;
        } else if (block.timestamp <= proposal.endTime) {
            return ProposalState.Active;
        } else if (proposal.forVotes <= proposal.againstVotes || !_quorumReached(proposalId)) {
            return ProposalState.Defeated;
        } else {
            return ProposalState.Succeeded;
        }
    }

    function _quorumReached(uint256 proposalId) internal view returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        uint256 quorum = (eduToken.totalSupply() * QUORUM_PERCENTAGE) / 100;
        return totalVotes >= quorum;
    }

    function executeProposal(uint256 proposalId) external onlyRole(EXECUTOR_ROLE) {
        require(state(proposalId) == ProposalState.Succeeded, "Proposal not succeeded");
        
        proposals[proposalId].executed = true;
        emit ProposalExecuted(proposalId);
    }

    function cancelProposal(uint256 proposalId) external {
        require(
            msg.sender == proposals[proposalId].proposer || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not authorized to cancel"
        );
        require(state(proposalId) != ProposalState.Executed, "Cannot cancel executed proposal");
        
        proposals[proposalId].canceled = true;
        emit ProposalCanceled(proposalId);
    }

    function getProposalVotes(uint256 proposalId) 
        external 
        view 
        returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes) 
    {
        Proposal storage proposal = proposals[proposalId];
        return (proposal.againstVotes, proposal.forVotes, proposal.abstainVotes);
    }

    function hasVoted(uint256 proposalId, address account) external view returns (bool) {
        return proposals[proposalId].hasVoted[account];
    }

    function getVote(uint256 proposalId, address account) external view returns (uint8) {
        require(proposals[proposalId].hasVoted[account], "Account has not voted");
        return proposals[proposalId].votes[account];
    }

    function getProposalDetails(uint256 proposalId) 
        external 
        view 
        returns (
            address proposer,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            uint256 forVotes,
            uint256 againstVotes,
            uint256 abstainVotes,
            bool canceled,
            bool executed
        ) 
    {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.proposer,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            proposal.canceled,
            proposal.executed
        );
    }

    function getAllProposals() external view returns (uint256[] memory) {
        uint256[] memory proposalIds = new uint256[](proposalCount);
        for (uint256 i = 0; i < proposalCount; i++) {
            proposalIds[i] = i;
        }
        return proposalIds;
    }

    function getActiveProposals() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active proposals
        for (uint256 i = 0; i < proposalCount; i++) {
            if (state(i) == ProposalState.Active) {
                activeCount++;
            }
        }
        
        // Create array of active proposal IDs
        uint256[] memory activeProposals = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < proposalCount; i++) {
            if (state(i) == ProposalState.Active) {
                activeProposals[index] = i;
                index++;
            }
        }
        
        return activeProposals;
    }

    function updateVotingParameters(
        uint256 newProposalThreshold,
        uint256 newQuorumPercentage
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        // This would require a governance proposal in a real implementation
        // For now, only admin can update
    }
}
