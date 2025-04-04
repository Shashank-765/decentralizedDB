// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DocumentVerification {
    address public admin;

    struct Document {
        string ipfsHash;
        bool verified;
    }

    mapping(address => Document[]) private userDocuments;
    address[] private users;
    mapping(address => bool) private hasUploaded;

    event DocumentUploaded(address indexed user, string ipfsHash, bool verified);
    event DocumentVerified(address indexed user, uint256 index, bool verified);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyUser(address user) {
        require(msg.sender == user, "You can only access your own documents");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

   function uploadDocument(address user, string memory ipfsHash) external onlyAdmin {
    // Check if the IPFS hash already exists for the user
    Document[] storage docs = userDocuments[user];
    for (uint i = 0; i < docs.length; i++) {
        require(keccak256(abi.encodePacked(docs[i].ipfsHash)) != keccak256(abi.encodePacked(ipfsHash)), "IPFS hash already exists");
    }

    // Add document if it doesn't exist
    userDocuments[user].push(Document(ipfsHash, false));

    // Track unique users who have uploaded
    if (!hasUploaded[user]) {
        users.push(user);
        hasUploaded[user] = true;
    }

    emit DocumentUploaded(user, ipfsHash, false);
}


    function verifyDocument(address user, uint256 index) external onlyAdmin {
        require(index < userDocuments[user].length, "Invalid document index");
        userDocuments[user][index].verified = true;
        emit DocumentVerified(user, index, true);
    }

    function viewDocuments(address _user) external view returns (string[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < userDocuments[_user].length; i++) {
            if (userDocuments[_user][i].verified) {
                count++;
            }
        }

        string[] memory verifiedDocs = new string[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < userDocuments[_user].length; i++) {
            if (userDocuments[_user][i].verified) {
                verifiedDocs[index] = userDocuments[_user][i].ipfsHash;
                index++;
            }
        }
        return verifiedDocs;
    }

    function viewAllDocuments(address user) external view  returns (Document[] memory) {
        return userDocuments[user];
    }

    function getAllUsers() external view onlyAdmin returns (address[] memory) {
        return users;
    }
}
