// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DonationRegistry {
    address public admin;
    uint256 public donationCount;
    uint256 public totalAmount;

    struct Donation {
        uint256 id;
        address donor;
        string donorName;
        uint256 amount;
        string referenceNumber;
        string blockHash;
        uint256 timestamp;
    }

    mapping(uint256 => Donation) public donations;

    event DonationRecorded(
        uint256 indexed id,
        address indexed donor,
        string donorName,
        uint256 amount,
        string referenceNumber,
        string blockHash,
        uint256 timestamp
    );

    constructor() {
        admin = msg.sender;
    }

    function recordDonation(
        address _donor,
        string calldata _donorName,
        uint256 _amount,
        string calldata _referenceNumber,
        string calldata _blockHash
    ) external returns (uint256) {
        donationCount += 1;
        totalAmount += _amount;

        donations[donationCount] = Donation(
            donationCount,
            _donor,
            _donorName,
            _amount,
            _referenceNumber,
            _blockHash,
            block.timestamp
        );

        emit DonationRecorded(
            donationCount,
            _donor,
            _donorName,
            _amount,
            _referenceNumber,
            _blockHash,
            block.timestamp
        );

        return donationCount;
    }

    function getTotalDonations() external view returns (uint256) {
        return donationCount;
    }

    function getTotalAmount() external view returns (uint256) {
        return totalAmount;
    }
}
