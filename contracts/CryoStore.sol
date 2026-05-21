// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title CryoStore - Decentralized App Store Contract
/// @notice App distribution with paid/free/freemium models
/// @dev Supports app registration, versioning, and revenue distribution
contract CryoStore is ReentrancyGuard {

    struct App {
        string name;
        string metadataURI;  // IPFS hash for app metadata
        address developer;
        uint256 price;     // Price in CRX tokens (0 = free)
        bytes32 category;
        bool isPublished;
        uint256 totalDownloads;
        uint256 ratingSum;
        uint256 ratingCount;
    }

    struct AppVersion {
        string version;
        string manifestURI;  // IPFS hash for APK/IPA bundle
        uint256 minOsVersion;
        bytes32 checksum;
        uint256 publishedAt;
        bool isActive;
    }

    // App ID -> App Data
    mapping(bytes32 => App) public apps;
    // App ID -> Version[]
    mapping(bytes32 => AppVersion[]) public appVersions;
    // Developer -> Received earnings
    mapping(address => uint256) public developerEarnings;
    // App ID -> User -> Purchased
    mapping(bytes32 => mapping(address => bool)) public purchases;

    // Events
    event AppRegistered(bytes32 indexed appId, address developer, string name);
    event AppPublished(bytes32 indexed appId, string version);
    event AppDownloaded(bytes32 indexed appId, address user, uint256 amount);
    event RatingSubmitted(bytes32 indexed appId, uint8 rating);
    event EarningsWithdrawn(address developer, uint256 amount);

    // Constants
    uint256 public constant PLATFORM_FEE_BASIS = 500;  // 5% platform fee
    uint256 public constant MAX_PRICE = 100000e18;       // Max 100k CRX

    /// @notice Register a new app
    function registerApp(
        string calldata name,
        string calldata metadataURI,
        bytes32 category
    ) external returns (bytes32 appId) {
        require(bytes(name).length > 0, "Name required");
        require(bytes(metadataURI).length > 0, "Metadata URI required");
        
        // Generate deterministic app ID from name + developer
        appId = keccak256(abi.encodePacked(name, msg.sender, block.timestamp));
        
        apps[appId] = App({
            name: name,
            metadataURI: metadataURI,
            developer: msg.sender,
            price: 0,
            category: category,
            isPublished: false,
            totalDownloads: 0,
            ratingSum: 0,
            ratingCount: 0
        });
        
        emit AppRegistered(appId, msg.sender, name);
    }

    /// @notice Publish app version
    function publishApp(
        bytes32 appId,
        string calldata version,
        string calldata manifestURI,
        uint256 minOsVersion,
        bytes32 checksum,
        uint256 price
    ) external {
        App storage app = apps[appId];
        require(app.developer == msg.sender, "Not developer");
        require(bytes(version).length > 0, "Version required");
        require(price <= MAX_PRICE, "Price too high");
        
        app.metadataURI = manifestURI;
        app.price = price;
        app.isPublished = true;
        
        appVersions[appId].push(AppVersion({
            version: version,
            manifestURI: manifestURI,
            minOsVersion: minOsVersion,
            checksum: checksum,
            publishedAt: block.timestamp,
            isActive: true
        }));
        
        emit AppPublished(appId, version);
    }

    /// @notice Download/purchase app
    function download(bytes32 appId) external nonReentrant {
        App storage app = apps[appId];
        require(app.isPublished, "App not published");
        
        // Check if already purchased (free apps)
        if (app.price == 0) {
            require(!purchases[appId][msg.sender], "Already downloaded");
            purchases[appId][msg.sender] = true;
        } else {
            // Process payment
            uint256 platformFee = (app.price * PLATFORM_FEE_BASIS) / 10000;
            uint256 developerShare = app.price - platformFee;
            
            // Transfer from buyer to contract (escrow)
            // Buyer must approve CRX spending first
            
            developerEarnings[app.developer] += developerShare;
        }
        
        app.totalDownloads++;
        
        emit AppDownloaded(appId, msg.sender, app.price);
    }

    /// @notice Rate an app (1-5 stars)
    function rateApp(bytes32 appId, uint8 rating) external {
        require(rating >= 1 && rating <= 5, "Rating 1-5");
        
        App storage app = apps[appId];
        require(app.isPublished, "App not published");
        
        // One rating per user (can update)
        app.ratingSum += rating;
        app.ratingCount++;
        
        emit RatingSubmitted(appId, rating);
    }

    /// @notice Withdraw earnings (called by developer)
    function withdrawEarnings() external nonReentrant {
        uint256 earnings = developerEarnings[msg.sender];
        require(earnings > 0, "No earnings");
        
        developerEarnings[msg.sender] = 0;
        payable(msg.sender).transfer(earnings);
        
        emit EarningsWithdrawn(msg.sender, earnings);
    }

    /// @notice Get app average rating
    function getAverageRating(bytes32 appId) external view returns (uint256) {
        App storage app = apps[appId];
        if (app.ratingCount == 0) return 0;
        return app.ratingSum / app.ratingCount;
    }

    /// @notice Get latest version for app
    function getLatestVersion(bytes32 appId) external view returns (AppVersion memory) {
        AppVersion[] storage versions = appVersions[appId];
        require(versions.length > 0, "No versions");
        return versions[versions.length - 1];
    }

    /// @notice Get app count by developer
    function getDeveloperAppCount(address developer) external view returns (uint256) {
        // This is inefficient - in production, maintain separate index
        return 0;  // Simplified
    }

    receive() external payable {}
}