// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title Nectr Token
 * @dev Implementation of the Nectr Token
 * Features:
 * - ERC20 standard functionality
 * - Burnable by token holders
 * - Public minting with restrictions:
 *   - Max 1M tokens per mint (1M)
 *   - Can't mint if balance > 1 billion tokens
 *   - Total supply capped at 100B tokens (100B)
 */
contract NectrToken is ERC20, ERC20Burnable {
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10 ** 18; // 100 million tokens (100M)
    uint256 public constant MAX_SUPPLY = 100_000_000_000 * 10 ** 18; // 100 billion tokens (100B)
    uint256 public constant MAX_MINT_AMOUNT = 1_000_000 * 10 ** 18; // 1 million tokens (1M)
    uint256 public constant MAX_BALANCE_TO_MINT = 1_000_000_000 * 10 ** 18; // 1 billion tokens

    error MintingRestrictedDueToBalance();
    error MaxMintAmountExceeded();
    error MaxSupplyExceeded();

    constructor() ERC20("Nectr Token", "NECTR") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev Public mint function with restrictions
     * @param amount Amount of tokens to mint
     */
    function mint(uint256 amount) public {
        // Check if the sender's balance is too high
        if (balanceOf(msg.sender) > MAX_BALANCE_TO_MINT) {
            revert MintingRestrictedDueToBalance();
        }

        // Check if the mint amount is within limits
        if (amount > MAX_MINT_AMOUNT) {
            revert MaxMintAmountExceeded();
        }

        // Check if minting would exceed max supply
        if (totalSupply() + amount > MAX_SUPPLY) {
            revert MaxSupplyExceeded();
        }

        _mint(msg.sender, amount);
    }
}
