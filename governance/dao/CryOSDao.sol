// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * CRXToken - Governance Enabled
 * 
 * Extension of OZ Governor for CryOS DAO governance.
 * Supports:
 * - Token-weighted voting
 * - Timelocked execution
 * - Quorum requirements
 * - Proposal thresholds
 */
contract CRXToken is ERC20, ERC20Votes {
    
    /// @notice Maximum supply: 21,000,000 tokens
    uint256 public constant MAX_SUPPLY = 21_000_000e18;
    
    /// @notice Governance parameters
    uint256 public proposalThreshold = 100e18;  // 100 CRX to propose
    uint256 public quorumVotes = 1_000_000e18;  // 1M CRX for quorum
    
    /// @notice Timelock controller
    address public timelock;
    
    /// @notice Governance settings
    uint256 public votingDelay = 1 days;     // 1 day from proposal to vote
    uint256 public votingPeriod = 5 days;     // 5 day voting window
    
    /// @notice Mapping: voter -> delegated votes
    mapping(address => uint256) public delegatedVotes;
    mapping(address => address) public delegates;
    
    /// @notice Checkpoint history for voting power
    struct Checkpoint {
        uint32 fromBlock;
        uint96 votes;
    }
    mapping(address => Checkpoint[]) public checkpoints;
    
    /// @notice Events
    event DelegateChanged(address indexed from, address indexed to, uint256 weight);
    event DelegateVotesChanged(address indexed delegate, uint256 previousVotes, uint256 newVotes);
    event ProposalCreated(uint256 id, address proposer, uint256 startBlock, uint256 endBlock, string description);
    event VoteCast(address voter, uint256 proposalId, uint8 support, uint256 weight);
    
    constructor() ERC20("CryOS Token", "CRX") ERC20Permit("CRX") {
        _mint(msg.sender, 7_350_000e18);  // Initial mint for tests
    }
    
    /**
     * @notice Mint tokens (only callable by governance)
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == timelock || msg.sender == owner(), "Neither timelock nor owner");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    /**
     * @notice Burn tokens
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    /**
     * @notice Delegate votes to another address
     */
    function delegate(address delegatee) external {
        _delegate(_msgSender(), delegatee);
    }
    
    /**
     * @notice Get current voting power
     */
    function getVotes(address account) public view override returns (uint256) {
        return balanceOf(account);
    }
    
    /**
     * @notice Override _afterTokenTransfer for auto-delegation
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
        
        // Auto-delegate if no existing delegation
        if (delegates[from] == address(0) && from != address(0)) {
            delegates[from] = from;
        }
    }
    
    /// Overrides required by solc compiler
    function clock() public view override returns (uint32) {
        return uint32(block.number);
    }
    
    function CANCEL_PROPOSAL_TYPEHASH() public pure returns (bytes32) {
        return keccak256("CancelProposal(uint256 proposalId)");
    }
    
    function EXTENDED_FUNCTIONS_TYPEHASH() public pure returns (bytes32) {
        return keccak256("ExtendedFunctions(string description)");
    }
}


/**
 * CryOS DAO Governor
 * 
 * On-chain governance with:
 * - Token-weighted voting (CRX)
 * - Timelock execution
 * - Multiple proposal types
 * - Emergency controls
 */
contract CryOSDao is Governor, GovernorCountingSimple, GovernorVotes, GovernorTimelockControl {
    
    /// @notice Token used for voting
    CRXToken public immutable crxToken;
    
    /// @notice Timelock executor
    TimelockController public timelock;
    
    /// @inheritdoc Governor
    uint256 public immutable votingPeriod_;
    
    /// @inheritdoc Governor
    uint256 public immutable votingDelay_;
    
    /// @notice Proposal fee (prevent spam)
    uint256 public proposalFee = 10e18;  // 10 CRX
    
    /// @notice Active proposals
    uint256 private _proposalCount;
    mapping(uint256 => Proposal) public proposals;
    
    enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Queued,
        Executed,
        Expired
    }
    
    struct Proposal {
        address proposer;
        uint256 startBlock;
        uint256 endBlock;
        string description;
        ProposalState state;
        uint256 forVotes;
        uint256 againstVotes;
        address[] targets;
        uint256[] values;
        bytes[] calldatas;
    }
    
    /**
     * @notice Constructor
     */
    constructor(
        CRXToken _token,
        TimelockController _timelock,
        uint256 _votingPeriod,
        uint256 _votingDelay,
        uint256 _quorum
    )
        Governor("CryOS DAO")
        GovernorVotes(_token)
        GovernorTimelockControl(_timelock)
    {
        crxToken = _token;
        timelock = _timelock;
        votingPeriod_ = _votingPeriod;
        votingDelay_ = _votingDelay;
        quorum = _quorum;
    }
    
    /// @inheritdoc Governor
    function votingDelay() public view override returns (uint256) {
        return votingDelay_;
    }
    
    /// @inheritdoc Governor
    function votingPeriod() public view override returns (uint256) {
        return votingPeriod_;
    }
    
    /// @inheritdoc Governor
    function quorum(uint256 blockNumber) public view override returns (uint256) {
        return quorum;
    }
    
    /// @inheritdoc Governor
    function state(uint256 proposalId) public view override returns (ProposalState) {
        return proposals[proposalId].state;
    }
    
    /**
     * @notice Create new proposal
     */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override returns (uint256) {
        require(
            crxToken.getVotes(_msgSender()) >= proposalThreshold(),
            "Below threshold"
        );
        
        uint256 proposalId = ++_proposalCount;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.proposer = _msgSender();
        proposal.startBlock = block.number + votingDelay();
        proposal.endBlock = proposal.startBlock + votingPeriod();
        proposal.description = description;
        proposal.targets = targets;
        proposal.values = values;
        proposal.calldatas = calldatas;
        proposal.state = ProposalState.Pending;
        
        emit ProposalCreated(proposalId, _msgSender(), proposal.startBlock, proposal.endBlock, description);
        
        return proposalId;
    }
    
    /**
     * @notice Execute queued proposal
     */
    function execute(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) public payable override returns (uint256) {
        uint256 proposalId = hashProposal(targets, values, calldatas, descriptionHash);
        
        Proposal storage proposal = proposals[proposalId];
        require(proposal.state == ProposalState.Queued, "Not queued");
        
        proposal.state = ProposalState.Executed;
        
        _execute(targets, values, calldatas);
        
        emit ProposalExecuted(proposalId);
        
        return proposalId;
    }
    
    /**
     * @notice Cast vote
     */
    function castVote(uint256 proposalId, uint8 support) public override returns (uint256) {
        address voter = _msgSender();
        return _castVote(proposalId, voter, support, "");
    }
    
    function _castVote(
        uint256 proposalId,
        address voter,
        uint8 support,
        bytes memory // rationale
    ) internal virtual override(Governor, GovernorCountingSimple) returns (uint256) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.state == ProposalState.Active, "Not active");
        
        uint256 weight = crxToken.getVotes(voter);
        require(weight > 0, "No voting power");
        
        if (support == 1) {
            proposal.forVotes += weight;
        } else if (support == 0) {
            proposal.againstVotes += weight;
        } else {
            // Abstain - count towards quorum
            proposal.forVotes += weight;
        }
        
        emit VoteCast(voter, proposalId, support, weight);
        
        return weight;
    }
    
    /**
     * @notice Queue proposal to timelock
     */
    function queue(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.state == ProposalState.Succeeded, "Not succeeded");
        
        proposal.state = ProposalState.Queued;
        
        // Queue to timelock
        for (uint256 i = 0; i < proposal.targets.length; i++) {
            timelock.queueTransaction(
                proposal.targets[i],
                proposal.values[i],
                proposal.calldatas[i],
                bytes32(0),
                proposal.endBlock
            );
        }
    }
    
    /// @inheritdoc Governor
    function proposalThreshold() public view override returns (uint256) {
        return proposalFee;
    }
    
    /// @inheritdoc GovernorTimelockControl
    function timelock() public view override returns (address) {
        return address(timelock);
    }
    
    /// Overrides required
    function supportsInterface(bytes4 interfaceId) public pure override(Governor, GovernorTimelockControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}


/**
 * Timelock Controller for DAO
 * 
 * Delay-based execution:
 * - Minimum delay: 2 days
 * - Maximum delay: 30 days
 */
contract TimelockController is AccessControl {
    
    bytes32 public constant PROPOSAL_EXECUTOR_ROLE = keccak256("PROPOSAL_EXECUTOR_ROLE");
    bytes32 public constant TIMELOCK_ADMIN_ROLE = keccak256("TIMELOCK_ADMIN_ROLE");
    
    uint256 public constant MINIMUM_DELAY = 2 days;
    uint256 public constant MAXIMUM_DELAY = 30 days;
    
    uint256 public delay;
    
    mapping(bytes32 => uint256) public timestamps;
    mapping(bytes32 => bool) public queuedTransactions;
    
    /// @notice Event
    event CallScheduled(bytes32 indexed txHash, address indexed target, uint256 value, bytes data, uint256 eta);
    event CallExecuted(bytes32 indexed txHash, address indexed target, uint256 value, bytes data);
    event DelayedOperation(uint256 eta);
    
    constructor(uint256 _delay) {
        require(_delay >= MINIMUM_DELAY, "Delay too short");
        require(_delay <= MAXIMUM_DELAY, "Delay too long");
        
        delay = _delay;
        
        _grantRole(TIMELOCK_ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSAL_EXECUTOR_ROLE, msg.sender);
    }
    
    /**
     * @notice Schedule call
     */
    function scheduleTransaction(
        address target,
        uint256 value,
        bytes calldata data,
        bytes32 predecessor,
        uint256 salt
    ) external onlyRole(PROPOSAL_EXECUTOR_ROLE) {
        bytes32 txHash = keccak256(abi.encode(target, value, data, salt, block.timestamp));
        uint256 eta = block.timestamp + delay;
        
        timestamps[txHash] = eta;
        queuedTransactions[txHash] = true;
        
        emit CallScheduled(txHash, target, value, data, eta);
    }
    
    /**
     * @notice Execute scheduled call
     */
    function executeTransaction(
        address target,
        uint256 value,
        bytes calldata data,
        bytes32 predecessor,
        uint256 salt
    ) external onlyRole(PROPOSAL_EXECUTOR_ROLE) returns (bytes memory) {
        bytes32 txHash = keccak256(abi.encode(target, value, data, salt, block.timestamp));
        require(queuedTransactions[txHash], "Not queued");
        require(getBlockTimestamp() >= timestamps[txHash], "Too early");
        
        queuedTransactions[txHash] = false;
        
        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success, "Call failed");
        
        emit CallExecuted(txHash, target, value, data);
        
        return result;
    }
    
    function getBlockTimestamp() internal view returns (uint256) {
        return block.timestamp;
    }
}