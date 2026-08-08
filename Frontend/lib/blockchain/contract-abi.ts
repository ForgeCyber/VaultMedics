import { flare, flareTestnet} from 'wagmi/chains'

// Contract ABI for MedicalRecordRegistry
// Extracted from MedicalRecordRegistry.sol

export const MEDICAL_RECORD_REGISTRY_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "patient",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "provider",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "expiresAt",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "ConsentGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "patient",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "provider",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "ConsentRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "providerAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "providerName",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "specialty",
        type: "string",
      },
    ],
    name: "ProviderRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "recordHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "patient",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "recordType",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "RecordCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "recordHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "patient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "RecordDeactivated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "recordHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "patient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "RecordReactivated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "recordHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "ipfsHash",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "RecordUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "newFee",
        type: "uint256",
      },
    ],
    name: "RegistryFeeUpdated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "consents",
    outputs: [
      {
        internalType: "address",
        name: "patient",
        type: "address",
      },
      {
        internalType: "address",
        name: "provider",
        type: "address",
      },
      {
        internalType: "bool",
        name: "hasAccess",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "grantedAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expiresAt",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "recordHash",
        type: "bytes32",
      },
      {
        internalType: "string",
        name: "recordType",
        type: "string",
      },
      {
        internalType: "string",
        name: "ipfsHash",
        type: "string",
      },
    ],
    name: "createRecord",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "recordHash",
        type: "bytes32",
      },
    ],
    name: "deactivateRecord",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "patient",
        type: "address",
      },
      {
        internalType: "address",
        name: "provider",
        type: "address",
      },
    ],
    name: "getConsent",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "patient",
            type: "address",
          },
          {
            internalType: "address",
            name: "provider",
            type: "address",
          },
          {
            internalType: "bool",
            name: "hasAccess",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "grantedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "expiresAt",
            type: "uint256",
          },
        ],
        internalType: "struct MedicalRecordRegistry.Consent",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "patient",
        type: "address",
      },
    ],
    name: "getPatientRecordCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "patient",
        type: "address",
      },
    ],
    name: "getPatientRecords",
    outputs: [
      {
        internalType: "bytes32[]",
        name: "",
        type: "bytes32[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "provider",
        type: "address",
      },
    ],
    name: "getPatients",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getProvider",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "providerAddress",
            type: "address",
          },
          {
            internalType: "string",
            name: "providerName",
            type: "string",
          },
          {
            internalType: "string",
            name: "specialty",
            type: "string",
          },
        ],
        internalType: "struct MedicalRecordRegistry.ProviderInfo[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "recordHash",
        type: "bytes32",
      },
    ],
    name: "getRecord",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "recordHash",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "patient",
            type: "address",
          },
          {
            internalType: "address",
            name: "creator",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "recordType",
            type: "string",
          },
          {
            internalType: "string",
            name: "ipfsHash",
            type: "string",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
        ],
        internalType: "struct MedicalRecordRegistry.MedicalRecord",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "provider",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "expiresAt",
        type: "uint256",
      },
    ],
    name: "grantConsent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "patient",
        type: "address",
      },
      {
        internalType: "address",
        name: "provider",
        type: "address",
      },
    ],
    name: "hasAccess",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "patientRecords",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "providerAddresses",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "providers",
    outputs: [
      {
        internalType: "address",
        name: "providerAddress",
        type: "address",
      },
      {
        internalType: "string",
        name: "providerName",
        type: "string",
      },
      {
        internalType: "string",
        name: "specialty",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "recordHash",
        type: "bytes32",
      },
    ],
    name: "reactivateRecord",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "recordCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "records",
    outputs: [
      {
        internalType: "bytes32",
        name: "recordHash",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "patient",
        type: "address",
      },
      {
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "recordType",
        type: "string",
      },
      {
        internalType: "string",
        name: "ipfsHash",
        type: "string",
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "providerName",
        type: "string",
      },
      {
        internalType: "string",
        name: "specialty",
        type: "string",
      },
    ],
    name: "registerProvider",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "registryFeeWei",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "provider",
        type: "address",
      },
    ],
    name: "revokeConsent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_paused",
        type: "bool",
      },
    ],
    name: "setPaused",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "newFee",
        type: "uint256",
      },
    ],
    name: "setRegistryFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "recordHash",
        type: "bytes32",
      },
      {
        internalType: "string",
        name: "newIpfsHash",
        type: "string",
      },
    ],
    name: "updateRecordIPFS",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

// Contract addresses by network
export const CONTRACT_ADDRESSES = {
  coston2: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "",
  flare: process.env.NEXT_PUBLIC_FLARE_REGISTRY_ADDRESS || "",
};

// Network configurations
export const NETWORKS = {
  coston2: {
    chainId: flareTestnet.id,
    name: flareTestnet.name,
    rpcUrl: flareTestnet.rpcUrls.default.http[0],
    explorerUrl: flareTestnet.blockExplorers.default.url,
    currency: {
      symbol: flareTestnet.nativeCurrency.symbol,
      decimal: flareTestnet.nativeCurrency.decimals,
    },
  },
  flare: {
    chainId: flare.id,
    name: flare.name,
    rpcUrl: flare.rpcUrls.default.http[0],
    explorerUrl: flare.blockExplorers.default.url,
    currency: {
      symbol: flare.nativeCurrency.symbol,
      decimal: flare.nativeCurrency.decimals
    },
  },
};
