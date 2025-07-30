export const OrgContractABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_admin",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "cid",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "docType",
          "type": "string"
        }
      ],
      "name": "DocumentUploaded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "enum OrgContract.Status",
          "name": "status",
          "type": "uint8"
        }
      ],
      "name": "DocumentVerified",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "documentsByUser",
      "outputs": [
        {
          "internalType": "string",
          "name": "cid",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "docType",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "uploadedBy",
          "type": "address"
        },
        {
          "internalType": "enum OrgContract.Status",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "uploadedAt",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getAllDocuments",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "cid",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "docType",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "uploadedBy",
              "type": "address"
            },
            {
              "internalType": "enum OrgContract.Status",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "uploadedAt",
              "type": "uint256"
            }
          ],
          "internalType": "struct OrgContract.Document[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllUsers",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getApprovedDocuments",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "cid",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "docType",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "uploadedBy",
              "type": "address"
            },
            {
              "internalType": "enum OrgContract.Status",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "uploadedAt",
              "type": "uint256"
            }
          ],
          "internalType": "struct OrgContract.Document[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getDocument",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "cid",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "docType",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "uploadedBy",
              "type": "address"
            },
            {
              "internalType": "enum OrgContract.Status",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "uploadedAt",
              "type": "uint256"
            }
          ],
          "internalType": "struct OrgContract.Document",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "isUserKnown",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "orgAdmin",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "orgName",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_cid",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_docType",
          "type": "string"
        }
      ],
      "name": "uploadDocument",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "users",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "approve",
          "type": "bool"
        }
      ],
      "name": "verifyDocument",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

export const SuperAdminABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "orgAdmin",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "AdminFunded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "orgAdmin",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "contractAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "orgName",
          "type": "string"
        }
      ],
      "name": "OrgCreated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "allOrgs",
      "outputs": [
        {
          "internalType": "address",
          "name": "orgContractAddress",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "orgName",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "orgAdmin",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "orgAdmin",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "orgName",
          "type": "string"
        }
      ],
      "name": "createOrganization",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "orgAdmin",
          "type": "address"
        }
      ],
      "name": "fundOrgAdmin",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllOrgAdminBalances",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "admins",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "balances",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllOrgs",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "orgContractAddress",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "orgName",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "orgAdmin",
              "type": "address"
            }
          ],
          "internalType": "struct SuperAdmin.OrgInfo[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "orgsByAdmin",
      "outputs": [
        {
          "internalType": "address",
          "name": "orgContractAddress",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "orgName",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "orgAdmin",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ];
