// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Nectr Staking
 * @dev Allows users to stake NECTR tokens and earn interest
 * Features:
 * - Stake for specific duration (5 mins to 2 years)
 * - Daily interest accrual
 * - Early withdrawal penalty
 * - No interest for early withdrawals
 */
contract NectrStaking is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Staking token (NECTR)
    IERC20 public immutable nectrToken;

    // Constants
    uint256 public constant SECONDS_PER_DAY = 86400;
    uint256 public constant PENALTY_DENOMINATOR = 100;
    uint256 public constant APR_DENOMINATOR = 10000;

    // Configurable parameters
    uint256 public minStakeDuration = 5 minutes; // Minimum staking period
    uint256 public maxStakeDuration = 730 days; // Maximum staking period (2 years)
    uint256 public earlyWithdrawalPenalty = 10; // 10% penalty
    uint256 public baseAPR = 730; // 7.3% annual base rate
    uint256 public bonusAPR = 1000; // 10% bonus for max duration

    // New state variables for total staked amount and active stakers count
    uint256 public totalStakedAmount;
    mapping(address => bool) private hasActiveStake;
    uint256 public activeStakersCount;

    // Stake information
    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        uint256 lastClaimTime;
        bool withdrawn;
    }

    // Mapping from user address to their stakes
    mapping(address => StakeInfo[]) public userStakes;

    // Events
    event Staked(
        address indexed user,
        uint256 amount,
        uint256 duration,
        uint256 stakeId
    );

    event Withdrawn(
        address indexed user,
        uint256 amount,
        uint256 interest,
        uint256 penalty,
        uint256 stakeId
    );

    event InterestClaimed(
        address indexed user,
        uint256 amount,
        uint256 stakeId
    );

    // Errors
    error InvalidDuration();
    error InvalidAmount();
    error StakeNotFound();
    error StakeAlreadyWithdrawn();
    error NoInterestAccrued();

    constructor(address _nectrToken) {
        nectrToken = IERC20(_nectrToken);
    }

    /**
     * @dev Calculate APR based on staking duration
     * @param duration Staking duration in seconds
     * @return APR value (base + bonus based on duration)
     */
    function calculateAPR(uint256 duration) public view returns (uint256) {
        if (duration >= maxStakeDuration) {
            return baseAPR + bonusAPR;
        }

        uint256 bonus = (bonusAPR * duration) / maxStakeDuration;
        return baseAPR + bonus;
    }

    /**
     * @dev Calculate accrued interest for a stake
     * @param stakeInfo Stake struct
     * @param currentTime Current timestamp
     * @return Interest amount
     */
    function calculateInterest(
        StakeInfo memory stakeInfo,
        uint256 currentTime
    ) public view returns (uint256) {
        if (stakeInfo.withdrawn || currentTime <= stakeInfo.lastClaimTime) {
            return 0;
        }

        uint256 endTime = currentTime > stakeInfo.endTime
            ? stakeInfo.endTime
            : currentTime;
        uint256 duration = endTime - stakeInfo.lastClaimTime;
        uint256 apr = calculateAPR(stakeInfo.endTime - stakeInfo.startTime);

        return
            (stakeInfo.amount * apr * duration) / (365 days * APR_DENOMINATOR);
    }

    /**
     * @dev Stake tokens for a specific duration
     * @param amount Amount to stake
     * @param duration Staking duration in seconds
     */
    function stake(uint256 amount, uint256 duration) external nonReentrant {
        if (duration < minStakeDuration || duration > maxStakeDuration) {
            revert InvalidDuration();
        }
        if (amount == 0) {
            revert InvalidAmount();
        }

        nectrToken.safeTransferFrom(msg.sender, address(this), amount);

        // Update total staked amount
        totalStakedAmount += amount;

        // Update active stakers count
        if (!hasActiveStake[msg.sender]) {
            hasActiveStake[msg.sender] = true;
            activeStakersCount++;
        }

        uint256 startTime = block.timestamp;
        userStakes[msg.sender].push(
            StakeInfo({
                amount: amount,
                startTime: startTime,
                endTime: startTime + duration,
                lastClaimTime: startTime,
                withdrawn: false
            })
        );

        emit Staked(
            msg.sender,
            amount,
            duration,
            userStakes[msg.sender].length - 1
        );
    }

    /**
     * @dev Withdraw staked tokens and any accrued interest
     * @param stakeId ID of the stake to withdraw
     */
    function withdraw(uint256 stakeId) external nonReentrant {
        if (stakeId >= userStakes[msg.sender].length) {
            revert StakeNotFound();
        }

        StakeInfo storage userStake = userStakes[msg.sender][stakeId];
        if (userStake.withdrawn) {
            revert StakeAlreadyWithdrawn();
        }

        uint256 currentTime = block.timestamp;
        uint256 interest = calculateInterest(userStake, currentTime);
        uint256 penalty = 0;

        // Apply penalty for early withdrawal
        if (currentTime < userStake.endTime) {
            penalty =
                (userStake.amount * earlyWithdrawalPenalty) /
                PENALTY_DENOMINATOR;
            interest = 0; // No interest for early withdrawal
        }

        uint256 totalAmount = userStake.amount + interest - penalty;
        userStake.withdrawn = true;

        nectrToken.safeTransfer(msg.sender, totalAmount);

        // Update total staked amount
        totalStakedAmount -= userStake.amount;

        // Update active stakers count
        if (getActiveStakesCount(msg.sender) == 0) {
            hasActiveStake[msg.sender] = false;
            activeStakersCount--;
        }

        emit Withdrawn(
            msg.sender,
            userStake.amount,
            interest,
            penalty,
            stakeId
        );
    }

    /**
     * @dev Claim accrued interest without withdrawing the stake
     * @param stakeId ID of the stake to claim interest from
     */
    function claimInterest(uint256 stakeId) external nonReentrant {
        if (stakeId >= userStakes[msg.sender].length) {
            revert StakeNotFound();
        }

        StakeInfo storage userStake = userStakes[msg.sender][stakeId];
        if (userStake.withdrawn) {
            revert StakeAlreadyWithdrawn();
        }

        uint256 currentTime = block.timestamp;
        uint256 interest = calculateInterest(userStake, currentTime);

        if (interest == 0) {
            revert NoInterestAccrued();
        }

        userStake.lastClaimTime = currentTime;
        nectrToken.safeTransfer(msg.sender, interest);

        emit InterestClaimed(msg.sender, interest, stakeId);
    }

    /**
     * @dev Get all stakes for a user
     * @param user Address of the user
     * @return Array of Stake structs
     */
    function getStakes(
        address user
    ) external view returns (StakeInfo[] memory) {
        return userStakes[user];
    }

    /**
     * @dev Get the number of active stakes for a user
     * @param user Address of the user
     * @return Number of active (non-withdrawn) stakes
     */
    function getActiveStakesCount(address user) public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < userStakes[user].length; i++) {
            if (!userStakes[user][i].withdrawn) {
                count++;
            }
        }
        return count;
    }

    /**
     * @dev Get the current APR for a specific duration
     * @param duration Staking duration in seconds
     * @return Current APR percentage (base + duration bonus)
     */
    function getCurrentAPR(uint256 duration) external view returns (uint256) {
        return calculateAPR(duration);
    }

    /**
     * @dev Get pending interest for a specific stake
     * @param user Address of the user
     * @param stakeId ID of the stake
     * @return Pending interest amount
     */
    function getPendingInterest(
        address user,
        uint256 stakeId
    ) external view returns (uint256) {
        if (stakeId >= userStakes[user].length) {
            return 0;
        }

        StakeInfo memory userStake = userStakes[user][stakeId];
        if (userStake.withdrawn) {
            return 0;
        }

        return calculateInterest(userStake, block.timestamp);
    }
}
