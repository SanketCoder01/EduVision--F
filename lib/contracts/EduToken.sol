// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract EduToken is ERC20, ERC20Burnable, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public totalMinted;

    event TokensEarned(address indexed student, uint256 amount, string reason);
    event TokensSpent(address indexed student, uint256 amount, string purpose);

    constructor() ERC20("EduVision Token", "EDU") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(totalMinted + amount <= MAX_SUPPLY, "Exceeds maximum supply");
        totalMinted += amount;
        _mint(to, amount);
    }

    function mintForAchievement(address student, uint256 amount, string memory reason) 
        public 
        onlyRole(MINTER_ROLE) 
    {
        require(totalMinted + amount <= MAX_SUPPLY, "Exceeds maximum supply");
        totalMinted += amount;
        _mint(student, amount);
        emit TokensEarned(student, amount, reason);
    }

    function burnForPurchase(address student, uint256 amount, string memory purpose) 
        public 
        onlyRole(MINTER_ROLE) 
    {
        require(balanceOf(student) >= amount, "Insufficient balance");
        _burn(student, amount);
        emit TokensSpent(student, amount, purpose);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    // Reward students for various achievements
    function rewardStudent(address student, string memory achievement) external onlyRole(MINTER_ROLE) {
        uint256 rewardAmount;
        
        if (keccak256(bytes(achievement)) == keccak256(bytes("assignment_completion"))) {
            rewardAmount = 10 * 10**18; // 10 EDU tokens
        } else if (keccak256(bytes(achievement)) == keccak256(bytes("perfect_score"))) {
            rewardAmount = 25 * 10**18; // 25 EDU tokens
        } else if (keccak256(bytes(achievement)) == keccak256(bytes("course_completion"))) {
            rewardAmount = 100 * 10**18; // 100 EDU tokens
        } else if (keccak256(bytes(achievement)) == keccak256(bytes("participation"))) {
            rewardAmount = 5 * 10**18; // 5 EDU tokens
        } else {
            rewardAmount = 1 * 10**18; // 1 EDU token default
        }

        mintForAchievement(student, rewardAmount, achievement);
    }

    // Allow students to spend tokens on platform features
    function spendTokens(address student, uint256 amount, string memory purpose) 
        external 
        onlyRole(MINTER_ROLE) 
    {
        burnForPurchase(student, amount, purpose);
    }

    // Get student's token balance
    function getStudentBalance(address student) external view returns (uint256) {
        return balanceOf(student);
    }

    // Check if student has enough tokens for a purchase
    function canAfford(address student, uint256 amount) external view returns (bool) {
        return balanceOf(student) >= amount;
    }
}
