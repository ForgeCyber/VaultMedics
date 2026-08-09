// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MedicalRecordRegistry
 * @dev A secure registry for medical records on BOT blockchain
 * Stores immutable proof of existence and metadata for medical records
 */

contract MedicalRecordRegistry {
    struct ProviderInfo {
        address providerAddress;
        string providerName;
        string specialty;
    }

    // Record structure
    struct MedicalRecord {
        bytes32 recordHash; // Hash of the record content
        address patient; // Patient's Ethereum address
        address creator; // Patient that create the record
        uint256 timestamp; // Block timestamp of creation
        string recordType; // e.g., "lab_report", "scan", "prescription"
        string ipfsHash; // IPFS hash for encrypted record storage
        bool isActive; // Whether the record is still valid
    }

    // Consent structure
    struct Consent {
        address patient;
        address provider; // Doctor or healthcare provider
        bool hasAccess; // Whether provider can access
        uint256 grantedAt; // When access was granted
        uint256 expiresAt; // When access expires (0 = never)
    }

    // State variables
    mapping(bytes32 => MedicalRecord) public records;
    mapping(address => bytes32[]) public patientRecords;
    mapping(address => mapping(address => Consent)) public consents;
    mapping(address => uint256) public recordCount;
    mapping(address => ProviderInfo) public providers;
    mapping(address => address[]) private providerPatients;

    address[] public providerAddresses;

    address public owner;
    uint256 public registryFeeWei;
    bool public paused;

    // Events
    event RecordCreated(
        bytes32 indexed recordHash,
        address indexed patient,
        address indexed creator,
        string recordType,
        uint256 timestamp
    );

    event RecordUpdated(bytes32 indexed recordHash, string ipfsHash, uint256 timestamp);

    event RecordDeactivated(bytes32 indexed recordHash, address indexed patient, uint256 timestamp);

    event RecordReactivated(bytes32 indexed recordHash, address indexed patient, uint256 timestamp);

    event ConsentGranted(address indexed patient, address indexed provider, uint256 expiresAt, uint256 timestamp);

    event ConsentRevoked(address indexed patient, address indexed provider, uint256 timestamp);

    event RegistryFeeUpdated(uint256 newFee);

    event ProviderRegistered(address indexed providerAddress, string providerName, string specialty);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier notPaused() {
        require(!paused, "Registry is paused");
        _;
    }

    modifier onlyPatient(address patient) {
        require(msg.sender == patient, "Only patient can perform this action");
        _;
    }

    modifier onlyProvider() {
        require(providers[msg.sender].providerAddress != address(0), "Only registered provider can call this");
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
        registryFeeWei = 0;
        paused = false;
    }

    // ============ Provider Management ============

    /**
     * @dev Register a new provider in the registry
     * @param providerName The name of the provider
     * @param specialty The specialty of the provider
     */
    function registerProvider(string memory providerName, string memory specialty) public notPaused {
        require(msg.sender != address(0), "Invalid provider address");
        require(bytes(providerName).length > 0, "Invalid provider name");
        require(bytes(specialty).length > 0, "Invalid specialty");
        require(providers[msg.sender].providerAddress == address(0), "Provider already registered");

        providers[msg.sender] = ProviderInfo({
            providerAddress: msg.sender,
            providerName: providerName,
            specialty: specialty
        });

        providerAddresses.push(msg.sender);

        emit ProviderRegistered(msg.sender, providerName, specialty);
    }

    /**
     * @dev Get provider details
     * @return The All provider details in ProviderInfo struct
     */
    function getProvider() public view returns (ProviderInfo[] memory) {
        ProviderInfo[] memory providerArray = new ProviderInfo[](providerAddresses.length);
        for (uint256 i = 0; i < providerAddresses.length; i++) {
            providerArray[i] = providers[providerAddresses[i]];
        }
        return providerArray;
    }

    /**
     * @dev Get all patient addresses that given a provider has access to his records
     * @param provider Address of the healthcare provider
     * @return Array of patient addresses
     */
    function getPatients(address provider) public view onlyProvider returns (address[] memory) {
        address[] storage allPatients = providerPatients[provider];

        uint256 count;

        for (uint256 i; i < allPatients.length; i++) {
            if (hasAccess(allPatients[i], provider)) {
                count++;
            }
        }

        address[] memory result = new address[](count);

        uint256 index;

        for (uint256 i; i < allPatients.length; i++) {
            if (hasAccess(allPatients[i], provider)) {
                result[index++] = allPatients[i];
            }
        }

        return result;
    }

    // ============ Record Management ============
    function createRecord(
        bytes32 recordHash,
        string memory recordType,
        string memory ipfsHash
    ) public payable notPaused returns (bytes32) {
        // Fee handling (optional for future monetization)
        if (registryFeeWei > 0) {
            require(msg.value >= registryFeeWei, "Insufficient fee");
        }

        require(recordHash != bytes32(0), "Invalid record hash");
        require(records[recordHash].timestamp == 0, "Record already exists");

        // Create record
        MedicalRecord storage record = records[recordHash];
        record.recordHash = recordHash;
        record.patient = msg.sender;
        record.creator = msg.sender;
        record.timestamp = block.timestamp;
        record.recordType = recordType;
        record.ipfsHash = ipfsHash;
        record.isActive = true;

        // Track patient records
        patientRecords[msg.sender].push(recordHash);
        recordCount[msg.sender]++;

        emit RecordCreated(recordHash, msg.sender, msg.sender, recordType, block.timestamp);

        return recordHash;
    }

    /**
     * @dev Update IPFS hash for an existing record
     * @param recordHash Hash of the record
     * @param newIpfsHash New IPFS hash
     */
    function updateRecordIPFS(bytes32 recordHash, string memory newIpfsHash) public notPaused {
        require(records[recordHash].timestamp != 0, "Record does not exist");
        require(records[recordHash].patient == msg.sender, "Not record owner");
        require(records[recordHash].isActive, "Record is not active");

        records[recordHash].ipfsHash = newIpfsHash;

        emit RecordUpdated(recordHash, newIpfsHash, block.timestamp);
    }

    /**
     * @dev Deactivate a record (soft delete)
     * @param recordHash Hash of the record
     */
    function deactivateRecord(bytes32 recordHash) public notPaused {
        require(records[recordHash].timestamp != 0, "Record does not exist");
        require(records[recordHash].patient == msg.sender, "Not record owner");

        records[recordHash].isActive = false;

        emit RecordDeactivated(recordHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Reactivate a record
     * @param recordHash Hash of the record
     */
    function reactivateRecord(bytes32 recordHash) public notPaused {
        require(records[recordHash].timestamp != 0, "Record does not exist");
        require(records[recordHash].patient == msg.sender, "Not record owner");

        records[recordHash].isActive = true;

        emit RecordReactivated(recordHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Get record details
     * @param recordHash Hash of the record
     * @return The MedicalRecord struct
     */
    function getRecord(bytes32 recordHash) public view returns (MedicalRecord memory) {
        require(records[recordHash].timestamp != 0, "Record does not exist");
        return records[recordHash];
    }

    // ============ Consent Management ============

    /**
     * @dev Grant access to a healthcare provider
     * @param provider Address of the healthcare provider
     * @param expiresAt Timestamp when consent expires (0 = never)
     */
    function grantConsent(address provider, uint256 expiresAt) public notPaused {
        require(provider != address(0), "Invalid provider address");
        require(provider != msg.sender, "Cannot consent to yourself");
        require(expiresAt == 0 || expiresAt > block.timestamp, "Invalid expiry");
        require(
            providers[provider].providerAddress != address(0),
            "Provider not registered"
        );

        if (consents[msg.sender][provider].patient == address(0)) {
            providerPatients[provider].push(msg.sender);
        }

        consents[msg.sender][provider] = Consent({
            patient: msg.sender,
            provider: provider,
            hasAccess: true,
            grantedAt: block.timestamp,
            expiresAt: expiresAt
        });

        emit ConsentGranted(msg.sender, provider, expiresAt, block.timestamp);
    }

    /**
     * @dev Revoke access from a healthcare provider
     * @param provider Address of the healthcare provider
     */
    function revokeConsent(address provider) public notPaused {
        require(consents[msg.sender][provider].hasAccess, "Consent not found");

        consents[msg.sender][provider].hasAccess = false;

        emit ConsentRevoked(msg.sender, provider, block.timestamp);
    }

    /**
     * @dev Check if a provider has access to patient's records
     * @param patient Patient address
     * @param provider Provider address
     * @return Whether provider has valid access
     */
    function hasAccess(address patient, address provider) public view returns (bool) {
        Consent memory consent = consents[patient][provider];

        if (!consent.hasAccess) return false;
        if (consent.expiresAt == 0) return true; // No expiry

        return consent.expiresAt > block.timestamp;
    }

    // ============ Query Functions ============

    /**
     * @dev Get all records for a patient
     * @param patient Patient address
     * @return Array of record hashes
     */
    function getPatientRecords(address patient) public view returns (bytes32[] memory) {
        return patientRecords[patient];
    }

    /**
     * @dev Get patient's record count
     * @param patient Patient address
     * @return Number of records
     */
    function getPatientRecordCount(address patient) public view returns (uint256) {
        return recordCount[patient];
    }

    /**
     * @dev Get consent details
     * @param patient Patient address
     * @param provider Provider address
     * @return The Consent struct
     */
    function getConsent(address patient, address provider) public view returns (Consent memory) {
        return consents[patient][provider];
    }

    // ============ Admin Functions ============

    /**
     * @dev Update the registry fee
     * @param newFee New fee in wei
     */
    function setRegistryFee(uint256 newFee) public onlyOwner {
        registryFeeWei = newFee;
        emit RegistryFeeUpdated(newFee);
    }

    /**
     * @dev Pause/unpause the registry
     */
    function setPaused(bool _paused) public onlyOwner {
        paused = _paused;
    }

    /**
     * @dev Withdraw collected fees
     */
    function withdrawFees() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner).transfer(balance);
    }

    /**
     * @dev Transfer ownership
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
