// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract LearningNFT is ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    Counters.Counter private _tokenIdCounter;

    struct Achievement {
        string title;
        string description;
        string category;
        uint256 timestamp;
        address student;
        string metadata;
    }

    mapping(uint256 => Achievement) public achievements;
    mapping(address => uint256[]) public studentAchievements;
    mapping(string => uint256) public categoryCount;

    event AchievementMinted(
        address indexed student,
        uint256 indexed tokenId,
        string title,
        string category
    );

    constructor() ERC721("EduVision Achievement", "EDUACH") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function mintAchievement(
        address student,
        string memory title,
        string memory description,
        string memory category,
        string memory tokenURI,
        string memory metadata
    ) public onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(student, tokenId);
        _setTokenURI(tokenId, tokenURI);

        achievements[tokenId] = Achievement({
            title: title,
            description: description,
            category: category,
            timestamp: block.timestamp,
            student: student,
            metadata: metadata
        });

        studentAchievements[student].push(tokenId);
        categoryCount[category]++;

        emit AchievementMinted(student, tokenId, title, category);

        return tokenId;
    }

    function getStudentAchievements(address student) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return studentAchievements[student];
    }

    function getAchievement(uint256 tokenId) 
        external 
        view 
        returns (Achievement memory) 
    {
        require(_exists(tokenId), "Achievement does not exist");
        return achievements[tokenId];
    }

    function getAchievementsByCategory(string memory category) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory result = new uint256[](categoryCount[category]);
        uint256 counter = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter.current(); i++) {
            if (keccak256(bytes(achievements[i].category)) == keccak256(bytes(category))) {
                result[counter] = i;
                counter++;
            }
        }
        
        return result;
    }

    function hasAchievement(address student, string memory category) 
        external 
        view 
        returns (bool) 
    {
        uint256[] memory studentTokens = studentAchievements[student];
        
        for (uint256 i = 0; i < studentTokens.length; i++) {
            if (keccak256(bytes(achievements[studentTokens[i]].category)) == keccak256(bytes(category))) {
                return true;
            }
        }
        
        return false;
    }

    function getTotalAchievements() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    function getStudentAchievementCount(address student) external view returns (uint256) {
        return studentAchievements[student].length;
    }

    // Predefined achievement categories
    function mintAssignmentCompletion(address student, string memory assignmentTitle) 
        external 
        onlyRole(MINTER_ROLE) 
        returns (uint256) 
    {
        return mintAchievement(
            student,
            string(abi.encodePacked("Assignment Completed: ", assignmentTitle)),
            "Successfully completed and submitted assignment",
            "assignment_completion",
            "https://ipfs.io/ipfs/QmAssignmentBadge",
            assignmentTitle
        );
    }

    function mintPerfectScore(address student, string memory subject) 
        external 
        onlyRole(MINTER_ROLE) 
        returns (uint256) 
    {
        return mintAchievement(
            student,
            string(abi.encodePacked("Perfect Score in ", subject)),
            "Achieved 100% score in assignment or exam",
            "perfect_score",
            "https://ipfs.io/ipfs/QmPerfectScoreBadge",
            subject
        );
    }

    function mintCourseCompletion(address student, string memory courseName) 
        external
        onlyRole(MINTER_ROLE) 
        returns (uint256) 
    {
        return mintAchievement(
            student,
            string(abi.encodePacked("Course Completed: ", courseName)),
            "Successfully completed entire course curriculum",
            "course_completion",
            "https://ipfs.io/ipfs/QmCourseCompletionBadge",
            courseName
        );
    }

    function mintParticipation(address student, string memory eventName) 
        external 
        onlyRole(MINTER_ROLE) 
        returns (uint256) 
    {
        return mintAchievement(
            student,
            string(abi.encodePacked("Participated in ", eventName)),
            "Active participation in educational event",
            "participation",
            "https://ipfs.io/ipfs/QmParticipationBadge",
            eventName
        );
    }

    function mintLeadership(address student, string memory role) 
        external 
        onlyRole(MINTER_ROLE) 
        returns (uint256) 
    {
        return mintAchievement(
            student,
            string(abi.encodePacked("Leadership Role: ", role)),
            "Demonstrated leadership skills in academic setting",
            "leadership",
            "https://ipfs.io/ipfs/QmLeadershipBadge",
            role
        );
    }

    // Override required functions
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
