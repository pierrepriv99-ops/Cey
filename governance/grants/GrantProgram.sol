// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * CryOS Grant Program
 * 
 * Quadratic Funding for open-source development:
 * - Anyone can contribute to matching pool
 * - Grants awarded by DAO voting
 * - Recipient clawback for non-compliance
 * - Quarterly funding rounds
 */
contract GrantProgram is Ownable {
    
    /// @notice CRT (Grants Token) for funding
    erc20 public immutable crt;
    
    /// @notice CRX ( governance token)
    erc20 public immutable crx;
    
    /// @notice Grant round timing
    uint256 public constant ROUND_DURATION = 90 days;
    uint256 public constant MAX_GRANT_SIZE = 500_000e18;
    uint256 public constant MIN_GRANT_SIZE = 10_000e18;
    
    /// @notice Round management
    uint256 public currentRound;
    uint256 public roundStartTime;
    uint256 public totalDistributed;
    uint256 public matchingPool;
    
    /// @notice Applications and grants
    mapping(uint256 => GrantApplication) public applications;
    mapping(address => Grant) public grants;
    mapping(address => uint256[]) public granteeApplications;
    
    uint256 private _applicationCount;
    
    enum ApplicationStatus {
        None,
        Submitted,
        Approved,
        Rejected,
        Paid,
        Clawback
    }
    
    struct GrantApplication {
        address applicant;
        uint256 requestedAmount;
        string descriptionHash;  // IPFS hash
        string projectRepo;
        uint256 submittedAt;
        ApplicationStatus status;
    }
    
    struct Grant {
        uint256 amount;
        uint256 disbursed;
        uint256 startTime;
        uint256 milestoneCount;
        uint256 completedMilestones;
        bool active;
    }
    
    /// @notice Events
    event RoundStarted(uint256 indexed round, uint256 matchingPool);
    event ApplicationSubmitted(uint256 indexed id, address indexed applicant, uint256 amount);
    event ApplicationApproved(uint256 indexed id, uint256 amount);
    event GrantPaid(address indexed recipient, uint256 amount);
    event MilestoneCompleted(address indexed recipient, uint256 milestone);
    event MatchingContributed(address indexed contributor, uint256 amount);
    
    /**
     * @notice Constructor
     */
    constructor(address _crt, address _crx) {
        crt = ERC20(_crt);
        crx = ERC20(_crx);
        currentRound = 1;
        roundStartTime = block.timestamp;
    }
    
    /**
     * @notice Start new funding round
     */
    function startNewRound() external onlyOwner {
        require(
            block.timestamp >= roundStartTime + ROUND_DURATION,
            "Round in progress"
        );
        
        currentRound++;
        roundStartTime = block.timestamp;
        
        emit RoundStarted(currentRound, matchingPool);
    }
    
    /**
     * @notice Contribute to matching pool
     */
    function contributeMatchingPool(uint256 amount) external {
        require(crt.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        matchingPool += amount;
        
        emit MatchingContributed(msg.sender, amount);
    }
    
    /**
     * @notice Submit grant application
     */
    function submitApplication(
        uint256 requestedAmount,
        string calldata descriptionHash,
        string calldata projectRepo
    ) external {
        require(requestedAmount >= MIN_GRANT_SIZE, "Below minimum");
        require(requestedAmount <= MAX_GRANT_SIZE, "Above maximum");
        
        uint256 id = ++_applicationCount;
        
        applications[id] = GrantApplication({
            applicant: msg.sender,
            requestedAmount: requestedAmount,
            descriptionHash: descriptionHash,
            projectRepo: projectRepo,
            submittedAt: block.timestamp,
            status: ApplicationStatus.Submitted
        });
        
        granteeApplications[msg.sender].push(id);
        
        emit ApplicationSubmitted(id, msg.sender, requestedAmount);
    }
    
    /**
     * @notice Approve application (called by DAO)
     */
    function approveApplication(uint256 id, uint256 approvedAmount, address recipient) 
        external 
        onlyOwner 
    {
        GrantApplication storage app = applications[id];
        require(app.status == ApplicationStatus.Submitted, "Not submitted");
        
        app.status = ApplicationStatus.Approved;
        app.requestedAmount = approvedAmount;
        
        // Create grant
        grants[recipient] = Grant({
            amount: approvedAmount,
            disbursed: 0,
            startTime: block.timestamp,
            milestoneCount: 0,
            completedMilestones: 0,
            active: true
        });
        
        emit ApplicationApproved(id, approvedAmount);
    }
    
    /**
     * @notice Fund approved grant
     */
    function fundGrant(address recipient, uint256 amount) external onlyOwner {
        Grant storage grant = grants[recipient];
        require(grant.active, "No active grant");
        require(grant.disbursed + amount <= grant.amount, "Exceeds grant");
        
        grant.disbursed += amount;
        totalDistributed += amount;
        
        require(crt.transfer(recipient, amount), "Transfer failed");
        
        emit GrantPaid(recipient, amount);
    }
    
    /**
     * @notice Report milestone completion
     */
    function completeMilestone(address recipient) external onlyOwner {
        Grant storage grant = grants[recipient];
        require(grant.active, "No active grant");
        
        grant.completedMilestones++;
        
        emit MilestoneCompleted(recipient, grant.completedMilestones);
    }
    
    /**
     * @notice Clawback funds (non-compliance)
     */
    function clawback(address recipient) external onlyOwner {
        Grant storage grant = grants[recipient];
        require(grant.active, "No active grant");
        
        uint256 remaining = grant.amount - grant.disbursed;
        
        grant.active = false;
        grant.disbursed = grant.amount;  // Mark as fully "disbursed"
        
        emit ApplicationRejected(_applicationCount, remaining);  // Reusing event
        
        // Remaining stays in contract for next round
    }
    
    /**
     * @notice Calculate quadratic funding match
     * 
     * Uses sqrt(count) * sqrt(amount) formula
     * for sybil-resistance
     */
    function calculateMatch(
        uint256[] calldata contributions,
        uint256[] calldata amounts
    ) external view returns (uint256) {
        require(contributions.length == amounts.length, "Arrays mismatch");
        
        uint256 totalMatch = 0;
        uint256 totalContributors = contributions.length;
        
        // Simplified quadratic: sqrt(sum(amounts)) * sqrt(num_contributors)
        uint256 totalAmount;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        uint256 sqrtAmount = _sqrt(totalAmount);
        uint256 sqrtContributors = _sqrt(totalContributions * 1e18);
        
        // Quadratic matching formula
        totalMatch = (sqrtAmount * sqrtContributors * matchingPool) / 1e18;
        
        return totalMatch;
    }
    
    /**
     * @notice Get applicant info
     */
    function getApplicantApplications(address applicant) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return granteeApplications[applicant];
    }
    
    /**
     * @notice Square root helper
     */
    function _sqrt(uint256 x) internal pure returns (uint256) {
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
}