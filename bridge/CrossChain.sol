// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * Cross-Chain Bridge Contract
 * 
 * Enables token transfers between chains via LayerZero/OApp pattern.
 * Supported: Ethereum, Polygon, BSC, Avalanche, Arbitrum, Optimism
 */
contract CrossChainBridge {
    
    // Chain IDs
    uint16 public constant ETHEREUM = 1;
    uint16 public constant POLYGON = 137;
    uint16 public constant BSC = 56;
    uint16 public constant AVALANCHE = 43114;
    uint16 public constant ARBITRUM = 42161;
    uint16 public constant OPTIMISM = 10;
    
    struct Transfer {
        uint256 id;
        address sender;
        address receiver;
        address token;
        uint256 amount;
        uint16 dstChainId;
        uint256 nonce;
        bool executed;
        uint256 timestamp;
    }
    
    mapping(uint256 => Transfer) public transfers;
    mapping(address => mapping(uint16 => bool)) public trustedRemotes;
    
    uint256 public transferCount;
    uint256 public fee = 0.001 ether;  // Cross-chain fee
    
    event TokenSent(
        uint256 indexed id,
        address indexed sender,
        address indexed receiver,
        address token,
        uint256 amount,
        uint16 dstChain
    );
    
    event TokenReceived(
        uint256 indexed id,
        address indexed receiver,
        address indexed token,
        uint256 amount,
        uint16 srcChain
    );
    
    modifier onlyTrustedRemote(uint16 srcChain, bytes calldata srcAddress) {
        require(
            trustedRemotes[bytesToAddress(srcAddress)][srcChain],
            "Invalid remote"
        );
        _;
    }
    
    function setTrustedRemote(uint16 chainId, address remote) external {
        trustedRemotes[remote][chainId] = true;
    }
    
    /**
     * Send tokens cross-chain
     */
    function send(
        address token,
        uint256 amount,
        address receiver,
        uint16 dstChain
    ) external payable returns (uint256) {
        require(msg.value >= fee, "Insufficient fee");
        require(dstChain != block.chainid, "Same chain");
        
        uint256 id = ++transferCount;
        
        // Transfer tokens from sender
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        emit TokenSent(id, msg.sender, receiver, token, amount, dstChain);
        
        return id;
    }
    
    /**
     * Receive tokens from another chain
     */
    function lzReceive(
        uint16 srcChain,
        bytes calldata srcAddress,
        uint256 nonce,
        address token,
        uint256 amount,
        address receiver
    ) external onlyTrustedRemote(srcChain, srcAddress) {
        uint256 id = ++transferCount;
        
        // Transfer tokens to receiver
        IERC20(token).transfer(receiver, amount);
        
        emit TokenReceived(id, receiver, token, amount, srcChain);
    }
    
    /**
     * Quote cross-chain fee
     */
    function quoteFee(uint16 dstChain, bool includeMsgFee) external view returns (uint256) {
        return fee;
    }
    
    bytes32 constant EMPTY = bytes32(0);
    
    function bytesToAddress(bytes calldata b) internal pure returns (address) {
        bytes memory addrBytes = bytes(b);
        require(addrBytes.length == 20);
        return address(uint160(uint256(bytes32(addrBytes))));
    }
}


/**
 * LayerZero Adapter
 * 
 * Integration contract for LayerZero messaging.
 */
contract LayerZeroAdapter {
    
    uint16 public constant HUB_CHAIN = 1;  // Ethereum as hub
    
    mapping(uint16 => bytes) public dstLookup;
    mapping(bytes => mapping(uint16 => bool)) public isTrustedRemote;
    
    event HubMessageSent(uint16 indexed dstChain, uint256 value);
    event HubMessageReceived(uint16 indexed srcChain, bytes payload);
    
    function sendViaLayerZero(
        uint16 dstChain,
        address dstContract,
        bytes calldata payload
    ) external payable {
        require(dstChain != HUB_CHAIN, "Use direct call");
        emit HubMessageSent(dstChain, msg.value);
    }
    
    function lzReceive(
        uint16 srcChain,
        bytes calldata srcChainAddr,
        bytes calldata payload
    ) external {
        emit HubMessageReceived(srcChain, payload);
    }
    
    function setDstLookup(uint16 chain, bytes calldata lookup) external {
        dstLookup[chain] = lookup;
    }
}


/**
 * Unified Token Bridge
 * 
 * Single entry point for all bridge operations.
 */
contract UnifiedBridge {
    
    CrossChainBridge public bridge;
    mapping(address => bool) public supportedTokens;
    
    event Bridged(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint16 destination,
        uint256 partnerId
    );
    
    constructor(address _bridge) {
        bridge = CrossChainBridge(_bridge);
    }
    
    function bridgeToken(
        address token,
        uint256 amount,
        uint16 destination
    ) external payable returns (uint256) {
        require(supportedTokens[token], "Unsupported token");
        
        uint256 partnerId = ++partnerIdx;
        
        emit Bridged(msg.sender, token, amount, destination, partnerId);
        
        return partnerId;
    }
    
    function addSupportedToken(address token) external {
        supportedTokens[token] = true;
    }
    
    uint256 partnerIdx;
}


// Minimal ERC20 interface
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}