// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;



contract OrgContract {
    address public orgAdmin;
    string public orgName;

    enum Status { Pending, Approved, Rejected }

    struct Document {
        string cid;
        string docType;
        address uploadedBy;
        Status status;
        uint256 uploadedAt;
    }

    // user => their documents
    mapping(address => Document[]) public documentsByUser;

    // unique list of users
    address[] public users;

    // used to track unique users
    mapping(address => bool) public isUserKnown;

    event DocumentUploaded(address indexed user, string cid, string docType);
    event DocumentVerified(address indexed user, uint256 index, Status status);

    modifier onlyOrgAdmin() {
        require(msg.sender == orgAdmin, "Only Org Admin");
        _;
    }

    constructor(address _admin, string memory _name) {
        orgAdmin = _admin;
        orgName = _name;
    }

    function uploadDocument(string memory _cid, string memory _docType) external {
        documentsByUser[msg.sender].push(Document({
            cid: _cid,
            docType: _docType,
            uploadedBy: msg.sender,
            status: Status.Pending,
            uploadedAt: block.timestamp
        }));

        if (!isUserKnown[msg.sender]) {
            users.push(msg.sender);
            isUserKnown[msg.sender] = true;
        }

        emit DocumentUploaded(msg.sender, _cid, _docType);
    }

    function verifyDocument(address user, uint256 index, bool approve) external onlyOrgAdmin {
        require(index < documentsByUser[user].length, "Invalid index");
        documentsByUser[user][index].status = approve ? Status.Approved : Status.Rejected;
        emit DocumentVerified(user, index, documentsByUser[user][index].status);
    }

    function getDocument(address user, uint256 index) external view returns (Document memory) {
        require(index < documentsByUser[user].length, "Invalid index");
        return documentsByUser[user][index];
    }

    function getAllDocuments(address user) external view returns (Document[] memory) {
        return documentsByUser[user];
    }

    function getAllUsers() external view returns (address[] memory) {
        return users;
    }

    function getApprovedDocuments(address user) external view returns (Document[] memory) {
        Document[] memory all = documentsByUser[user];
        uint256 count;

        for (uint256 i = 0; i < all.length; i++) {
            if (all[i].status == Status.Approved) {
                count++;
            }
        }

        Document[] memory approved = new Document[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < all.length; i++) {
            if (all[i].status == Status.Approved) {
                approved[j++] = all[i];
            }
        }

        return approved;
    }
}


contract SuperAdmin {
    address public owner;

    struct OrgInfo {
        address orgContractAddress;
        string orgName;
        address orgAdmin;
    }

    OrgInfo[] public allOrgs;
    mapping(address => OrgInfo) public orgsByAdmin;

    event OrgCreated(address indexed orgAdmin, address contractAddress, string orgName);
    event AdminFunded(address indexed orgAdmin, uint256 amount);
                    
    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only Super Admin allowed");
        _;
    }

    receive() external payable {
        require(msg.value > 0, " Amount that you want to send in the contract should not be ZERO(0)");
    }

    /**
     * @notice Create new organization and fund its admin
     * @param orgAdmin The address of the organization admin
     * @param orgName The name of the organization
     * 
     * NOTE: SuperAdmin must send at least 0.1 MATIC while calling this function
     */
    function createOrganization(address payable orgAdmin, string memory orgName)
        external
        payable
        onlyOwner
    {
        require(orgAdmin != address(0), "Invalid admin address");
        require(msg.value >= 0.1 ether, "Must send at least 0.1 MATIC");

        // Deploy new OrgContract
        OrgContract newOrg = new OrgContract(orgAdmin, orgName);

        // Save org info
        OrgInfo memory info = OrgInfo({
            orgContractAddress: address(newOrg),
            orgName: orgName,
            orgAdmin: orgAdmin
        });

        allOrgs.push(info);
        orgsByAdmin[orgAdmin] = info;

        // Transfer msg.value to orgAdmin
        (bool sent, ) = orgAdmin.call{value: msg.value}("");
        require(sent, "MATIC transfer to admin failed");

        emit OrgCreated(orgAdmin, address(newOrg), orgName);
        emit AdminFunded(orgAdmin, msg.value);
    }

    ///  View all organizations
    function getAllOrgs() external view returns (OrgInfo[] memory) {
        return allOrgs;
    }

    ///  View the current MATIC balances of all org admins
    function getAllOrgAdminBalances() external view returns (address[] memory admins, uint256[] memory balances) {
        uint256 len = allOrgs.length;
        admins = new address[](len);
        balances = new uint256[](len);
                                         
        for (uint256 i = 0; i < len; i++) {
            admins[i] = allOrgs[i].orgAdmin;
            balances[i] = allOrgs[i].orgAdmin.balance;
        }
    }

    ///  Fund an admin manually from your wallet
    function fundOrgAdmin(address payable orgAdmin) external payable onlyOwner {
        require(orgAdmin != address(0), "Invalid admin address");
        require(msg.value > 0, "Must send MATIC");

        (bool sent, ) = orgAdmin.call{value: msg.value}("");
        require(sent, "Funding failed");

        emit AdminFunded(orgAdmin, msg.value);
    }
}

