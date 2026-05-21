// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title CRXToken - CryOS Protocol Token
/// @notice ERC-20 token with minting, burning, and governance-ready features
contract CRXToken is ERC20, ERC20Burnable, Ownable {
    /// @notice Maximum supply cap (21 million tokens with 18 decimals)
    uint256 public constant MAX_SUPPLY = 21_000_000 * 1e18;

    /// @notice Emitted when tokens are minted
    event Minted(address indexed to, uint256 amount);

    /// @notice Emitted when tokens are burned
    event Burned(address indexed from, uint256 amount);

    /// @notice Error when minting would exceed max supply
    error ExceedsMaxSupply(uint256 requested, uint256 remaining);

    /// @notice Error when caller is not authorized
    error Unauthorized(address caller);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() ERC20("CryOS Token", "CRX") Ownable(msg.sender) {
        // Initial distribution can happen post-deploy via mint
    }

    /// @notice Mint new tokens (only owner)
    /// @dev Override: Check totalSupply + amount <= MAX_SUPPLY
    function mint(address to, uint256 amount) external onlyOwner {
        if (totalSupply() + amount > MAX_SUPPLY) {
            revert ExceedsMaxSupply(amount, MAX_SUPPLY - totalSupply());
        }
        _mint(to, amount);
        emit Minted(to, amount);
    }

    /// @notice Burns tokens from caller
    function burn(uint256 amount) public override {
        super.burn(amount);
        emit Burned(msg.sender, amount);
    }

    /// @notice Burns tokens from specific account (requires approval)
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        emit Burned(account, amount);
    }

    /// @notice Get current circulating supply
    function circulatingSupply() external view returns (uint256) {
        return totalSupply();
    }
}