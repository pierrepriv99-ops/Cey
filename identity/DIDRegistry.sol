// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * Decentralized Identity (DID)
 * 
 * Self-sovereign identity for the CryOS ecosystem.
 * Users control their own identity records.
 */
contract DecentralizedIdentity {
    
    struct IdentityRecord {
        address owner;
        string did;           // did:cryos:<address>
        string document;      // JSON document URI
        uint256 createdAt;
        uint256 updatedAt;
        bool active;
    }
    
    mapping(address => IdentityRecord) public identities;
    mapping(string => address) public didToOwner;
    mapping(address => string[]) public credentials;
    
    event DIDCreated(address indexed owner, string did);
    event DIDUpdated(address indexed owner, string document);
    event DIDRevoked(address indexed owner);
    event CredentialIssued(address indexed user, string credType);
    
    modifier onlyIdentityOwner() {
        require(identities[msg.sender].owner == msg.sender, "Not owner");
        _;
    }
    
    /**
     * Create new DID
     */
    function createDID(string memory document) external returns (string memory) {
        require(identities[msg.sender].owner == address(0), "Already exists");
        
        string memory did = string(
            abi.encodePacked("did:cryos:", toHexString(msg.sender))
        );
        
        identities[msg.sender] = IdentityRecord({
            owner: msg.sender,
            did: did,
            document: document,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            active: true
        });
        
        didToOwner[did] = msg.sender;
        
        emit DIDCreated(msg.sender, did);
        
        return did;
    }
    
    /**
     * Update DID document
     */
    function updateDocument(string memory document) external onlyIdentityOwner {
        IdentityRecord storage record = identities[msg.sender];
        record.document = document;
        record.updatedAt = block.timestamp;
        
        emit DIDUpdated(msg.sender, document);
    }
    
    /**
     * Revoke DID
     */
    function revokeDID() external onlyIdentityOwner {
        IdentityRecord storage record = identities[msg.sender];
        record.active = false;
        
        emit DIDRevoked(msg.sender);
    }
    
    /**
     * Get DID for address
     */
    function getDID(address addr) external view returns (string memory) {
        return identities[addr].did;
    }
    
    /**
     * Issue credential
     */
    function issueCredential(address user, string memory credType) external {
        // Basic KYC credential
        credentials[user].push(credType);
        
        emit CredentialIssued(user, credType);
    }
    
    /**
     * To hex string helper
     */
    function toHexString(address addr) internal pure returns (string memory) {
        bytes memory buffer = new bytes(40);
        for (uint256 i = 0; i < 20; i++) {
            bytes8 b = bytes8(uint256(uint160(addr)) >> (i * 8 + 8);
            buffer[i * 2] = char(bytes1(b >> 4));
            buffer[i * 2 + 1] = char(bytes1(b & 0x0f));
        }
        return string(buffer);
    }
    
    function char(bytes1 b) internal pure returns (bytes1) {
        return
            bytes1(
                b < bytes1(0x0a)
                    ? b + 0x30
                    : b + 0x57
            );
    }
}


/**
 * Verifiable Credentials (VC)
 * 
 * Issuance and presentation of verifiable claims.
 */
contract VerifiableCredentials {
    
    struct Credential {
        string credType;
        address issuer;
        uint256 issuedAt;
        uint256 expiresAt;
        string dataHash;
    }
    
    mapping(address => Credential[]) public holderCredentials;
    mapping(bytes32 => bool) public usedProofs;
    
    event CredentialIssued(
        address indexed holder,
        string credType,
        bytes32 credHash
    );
    event CredentialPresented(
        address indexed holder,
        bytes32 proofHash
    );
    
    /**
     * Issue credential
     */
    function issue(
        address holder,
        string memory credType,
        uint256 validityDays,
        string memory dataHash
    ) external returns (bytes32) {
        bytes32 credHash = keccak256(
            abi.encodePacked(holder, credType, block.timestamp, dataHash)
        );
        
        holderCredentials[holder].push(Credential({
            credType: credType,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            expiresAt: block.timestamp + (validityDays * 1 days),
            dataHash: dataHash
        }));
        
        emit CredentialIssued(holder, credType, credHash);
        
        return credHash;
    }
    
    /**
     * Present credential (zero-knowledge proof)
     */
    function present(
        address holder,
        string memory credType,
        bytes32 proofHash,
        bytes calldata proofData
    ) external {
        require(!usedProofs[proofHash], "Proof already used");
        
        usedProofs[proofHash] = true;
        
        emit CredentialPresented(holder, proofHash);
    }
    
    /**
     * Get credential count
     */
    function getCredentialCount(address holder) external view returns (uint256) {
        return holderCredentials[holder].length;
    }
}


/**
 * Hardware Wallet Registry
 * 
 * Registry for authorized hardware wallets.
 */
contract HardwareRegistry {
    
    struct Device {
        address walletAddress;
        string deviceType;     // "ledger", "trezor", "coldcard"
        string firmwareHash;
        uint256 addedAt;
        bool authorized;
    }
    
    mapping(address => Device[]) public userDevices;
    mapping(address => bool) public authorizedWallets;
    
    event DeviceRegistered(
        address indexed user,
        address walletAddress,
        string deviceType
    );
    event DeviceAuthorized(
        address indexed user,
        address walletAddress
    );
    
    /**
     * Register hardware wallet
     */
    function registerDevice(
        address walletAddress,
        string memory deviceType,
        string memory firmwareHash
    ) external {
        userDevices[msg.sender].push(Device({
            walletAddress: walletAddress,
            deviceType: deviceType,
            firmwareHash: firmwareHash,
            addedAt: block.timestamp,
            authorized: false
        }));
        
        emit DeviceRegistered(msg.sender, walletAddress, deviceType);
    }
    
    /**
     * Authorize device (sign with device)
     */
    function authorizeDevice(address walletAddress) external {
        require(
            devices[walletAddress].owner == msg.sender,
            "Not your device"
        );
        devices[walletAddress].authorized = true;
        authorizedWallets[walletAddress] = true;
        
        emit DeviceAuthorized(msg.sender, walletAddress);
    }
    
    mapping(address => Device) internal devices2;
}


/**
 * Soul-Bound Tokens (SBT)
 * 
 * Non-transferable NFTs for identity representation.
 */
contract SoulBoundTokens {
    
    struct SBT {
        address minter;
        address recipient;
        string uri;
        uint256 mintedAt;
    }
    
    mapping(uint256 => SBT) public sbtData;
    mapping(address => uint256[]) public recipientSBTs;
    
    uint256 public tokenId;
    mapping(uint256 => bool) public burned;
    
    event SBTMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        string uri
    );
    
    /**
     * Mint soul-bound token
     */
    function mint(address recipient, string memory uri) external returns (uint256) {
        uint256 id = ++tokenId;
        
        sbtData[id] = SBT({
            minter: msg.sender,
            recipient: recipient,
            uri: uri,
            mintedAt: block.timestamp
        });
        
        recipientSBTs[recipient].push(id);
        
        emit SBTMinted(id, recipient, uri);
        
        return id;
    }
    
    /**
     * Burn SBT
     */
    function burn(uint256 id) external {
        require(
            sbtData[id].recipient == msg.sender ||
            sbtData[id].minter == msg.sender,
            "Not authorized"
        );
        require(!burned[id], "Already burned");
        
        burned[id] = true;
    }
    
    struct Device {
        address owner;
    }
    mapping(address => Device) internal devices2;
    
    mapping(address => uint256[]) holderSBTs;
}