// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * CryOS Voting Mechanism
 * 
 * Quadratic voting for DAO governance.
 */
contract Voting {
    
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
       mapping(address => uint256) votes;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        bool killed;
    }
    
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    uint256 public constant QUORUM = 1_000_000e18;  // 1M CRX
    uint256 public constant VOTING_PERIOD = 3 days;
    
    mapping(address => uint256) public votes;
    
    event ProposalCreated(uint256 indexed id, string title, address proposer);
    event VoteCast(uint256 indexed id, address voter, uint256 weight, uint8 stance);
    event ProposalExecuted(uint256 indexed id);
    event ProposalKilled(uint256 indexed id);
    
    /**
     * Create proposal
     */
    function createProposal(
        string memory title,
        string memory description
    ) external returns (uint256) {
        require(votes[msg.sender] >= QUORUM / 100, "Below threshold");
        
        uint256 id = ++proposalCount;
        
        proposals[id] = Proposal({
            id: id,
            title: title,
            description: description,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + VOTING_PERIOD,
            executed: false,
            killed: false
        });
        
        emit ProposalCreated(id, title, msg.sender);
        
        return id;
    }
    
    /**
     * Cast vote with quadratic weighting
     */
    function castVote(uint256 proposalId, uint8 stance) external {
        Proposal storage p = proposals[proposalId];
        
        require(p.startTime > 0, "Does not exist");
        require(block.timestamp <= p.endTime, "Voting ended");
        require(!p.executed && !p.killed, "Finalized");
        
        uint256 weight = sqrt(votes[msg.sender]);
        
        if (stance == 1) {
            p.forVotes += weight;
        } else if (stance == 2) {
            p.againstVotes += weight;
        } else {
            p.abstainVotes += weight;
        }
        
        p.votes[msg.sender] = weight;
        
        emit VoteCast(proposalId, msg.sender, weight, stance);
    }
    
    /**
     * Execute proposal if passed
     */
    function executeProposal(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        
        require(block.timestamp > p.endTime, "Still voting");
        require(!p.executed && !p.killed, "Finalized");
        require(p.forVotes > p.againstVotes, "Failed");
        require(p.forVotes >= QUORUM, "No quorum");
        
        p.executed = true;
        
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * Kill proposal (emergency)
     */
    function emergencyKill(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        
        require(p.againstVotes > p.forVotes * 2, "Not rejected");
        
        p.killed = true;
        
        emit ProposalKilled(proposalId);
    }
    
    function sqrt(uint256 x) internal pure returns (uint256) {
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
    
    mapping(address => uint256) public votingPower;
}


/**
 * Treasury Allocation
 * 
 * Split treasury for different purposes.
 */
contract TreasurySplit {
    
    enum Category { DEVELOPMENT, MARKETING, GRANTS, OPERATIONS }
    
    struct Bucket {
        uint256 allocated;
        uint256 spent;
        uint256 cap;
    }
    
    mapping(Category => Bucket) public buckets;
    
    address public governance;
    address public guardian;
    
    modifier onlyGov() {
        require(msg.sender == governance);
        _;
    }
    
    constructor(address _governance) {
        governance = _governance;
        guardian = msg.sender;
        
        // Set caps
        buckets[Category.DEVELOPMENT] = Bucket(0, 0, 5_000_000e18);
        buckets[Category.MARKETING] = Bucket(0, 0, 2_000_000e18);
        buckets[Category.GRANTS] = Bucket(0, 0, 3_000_000e18);
        buckets[Category.OPERATIONS] = Bucket(0, 0, 1_000_000e18);
    }
    
    function allocate(Category cat, uint256 amount) external onlyGov {
        require(buckets[cat].spent + amount <= buckets[cat].cap, "Exceeds cap");
        
        buckets[cat].spent += amount;
    }
    
    function setCap(Category cat, uint256 newCap) external onlyGov {
        buckets[cat].cap = newCap;
    }
}


/**
 * Grant Program
 * 
 * Automated grant distribution.
 */
contract GrantProgram {
    
    struct Grant {
        address recipient;
        uint256 amount;
        uint256 milestone;
        bool claimed;
        uint256 paidAt;
    }
    
    mapping(uint256 => Grant) public grants;
    mapping(address => uint256[]) public recipientGrants;
    
    uint256 public grantCount;
    uint256 public totalAllocated;
    
    event GrantApproved(uint256 indexed id, address recipient, uint256 amount);
    event GrantClaimed(uint256 indexed id, address recipient, uint256 amount);
    
    /**
     * Approve grant
     */
    function approveGrant(address recipient, uint256 amount, uint256 milestone) 
        external 
        returns (uint256) 
    {
        uint256 id = ++grantCount;
        
        grants[id] = Grant({
            recipient: recipient,
            amount: amount,
            milestone: milestone,
            claimed: false,
            paidAt: 0
        });
        
        recipientGrants[recipient].push(id);
        
        emit GrantApproved(id, recipient, amount);
        
        return id;
    }
    
    /**
     * Claim grant
     */
    function claimGrant(uint256 grantId) external {
        Grant storage g = grants[grantId];
        
        require(g.recipient == msg.sender, "Not recipient");
        require(!g.claimed, "Already claimed");
        
        g.claimed = true;
        g.paidAt = block.timestamp;
        totalAllocated += g.amount;
        
        emit GrantClaimed(grantId, msg.sender, g.amount);
    }
    
    function getGrantCount() external view returns (uint256) {
        return grantCount;
    }
}