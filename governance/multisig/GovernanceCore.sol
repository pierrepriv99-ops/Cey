// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * CryOS Multi-Sig Wallet
 * 
 * Multi-signature wallet for treasury management.
 * Requires M-of-N signatures to execute.
 */
contract CryOSMultisig {
    
    event Execution(uint256 indexed txId, address indexed target, uint256 value);
    event Confirmation(uint256 indexed txId, address indexed owner);
    event Revocation(uint256 indexed txId, address indexed owner);
    
    struct Transaction {
        address target;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
    }
    
    mapping(uint256 => Transaction) public txs;
    mapping(uint256 => mapping(address => bool)) public confirmations;
    
    address[] public owners;
    uint256 public required;
    uint256 private txCount;
    
    modifier onlyOwner() {
        require(isOwner(msg.sender), "Not owner");
        _;
    }
    
    constructor(address[] memory _owners, uint256 _required) {
        require(_owners.length >= _required && _required >= 1, "Invalid params");
        owners = _owners;
        required = _required;
    }
    
    function isOwner(address addr) public view returns (bool) {
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == addr) return true;
        }
        return false;
    }
    
    function submitTransaction(address target, uint256 value, bytes calldata data) 
        external 
        returns (uint256) 
    {
        uint256 txId = txCount++;
        txs[txId] = Transaction({
            target: target,
            value: value,
            data: data,
            executed: false,
            confirmations: 0
        });
        
        confirmTransaction(txId);
        return txId;
    }
    
    function confirmTransaction(uint256 txId) public onlyOwner {
        require(!confirmations[txId][msg.sender], "Already confirmed");
        confirmations[txId][msg.sender] = true;
        txs[txId].confirmations++;
        
        emit Confirmation(txId, msg.sender);
        
        if (txs[txId].confirmations >= required) {
            executeTransaction(txId);
        }
    }
    
    function revokeConfirmation(uint256 txId) external onlyOwner {
        require(confirmations[txId][msg.sender], "Not confirmed");
        confirmations[txId][msg.sender] = false;
        txs[txId].confirmations--;
        
        emit Revocation(txId, msg.sender);
    }
    
    function executeTransaction(uint256 txId) internal {
        Transaction storage tx_ = txs[txId];
        require(!tx_.executed, "Already executed");
        require(tx_.confirmations >= required, "Need moreconfirmations");
        
        tx_.executed = true;
        
        (bool success, ) = tx_.target.call{value: tx_.value}(tx_.data);
        require(success, "Execution failed");
        
        emit Execution(txId, tx_.target, tx_.value);
    }
    
    receive() external payable {}
}


/**
 * Treasury Manager
 * 
 * Manages protocol funds with governance controls.
 */
contract Treasury {
    
    address public multisig;
    uint256 public totalDeposited;
    uint256 public totalWithdrawn;
    
    event Deposit(address indexed from, uint256 amount);
    event Withdrawal(address indexed to, uint256 amount);
    
    constructor(address _multisig) {
        multisig = _multisig;
    }
    
    function deposit() external payable {
        totalDeposited += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    function withdraw(address payable to, uint256 amount) external {
        require(msg.sender == multisig, "Only multisig");
        require(address(this).balance >= amount, "Insufficient balance");
        
        totalWithdrawn += amount;
        to.transfer(amount);
        
        emit Withdrawal(to, amount);
    }
    
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}


/**
 * Governance Portal
 * Web interface for DAO interactions
 */
contract GovernancePortal {
    
    struct Proposal {
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startBlock;
        bool executed;
        bool canceled;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => uint256) public votingPower;
    
    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD = 5 days;
    
    event ProposalCreated(uint256 id, string description);
    event VoteCast(uint256 id, address voter, bool support, uint256 weight);
    
    function createProposal(string memory description) external returns (uint256) {
        require(votingPower[msg.sender] >= 100e18, "Below threshold");
        
        uint256 id = ++proposalCount;
        proposals[id] = Proposal({
            description: description,
            forVotes: 0,
            againstVotes: 0,
            startBlock: block.number,
            executed: false,
            canceled: false
        });
        
        emit ProposalCreated(id, description);
        return id;
    }
    
    function castVote(uint256 proposalId, bool support) external {
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        
        uint256 weight = votingPower[msg.sender];
        require(weight > 0, "No voting power");
        
        hasVoted[proposalId][msg.sender] = true;
        
        if (support) {
            proposals[proposalId].forVotes += weight;
        } else {
            proposals[proposalId].againstVotes += weight;
        }
        
        emit VoteCast(proposalId, msg.sender, support, weight);
    }
    
    function setVotingPower(address[] calldata voters, uint256[] caldtata powers) external {
        require(voters.length == powers.length, "Length mismatch");
        
        for (uint256 i = 0; i < voters.length; i++) {
            votingPower[voters[i]] = powers[i];
        }
    }
}