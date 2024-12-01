// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

contract CertificateRegistry {
    
    struct Certificate {
        uint id;
        string studentName;
        string course;
        string issueDate;
        bool isValid;
    }

    mapping(uint => Certificate) public certificates;
    uint[] public certificateIds;

    event CertificateRegistered(uint id, string studentName, string course, string issueDate);
    event CertificateRevoked(uint id);

    function registerCertificate(uint _id, string memory _studentName, string memory _course, string memory _issueDate) public {
        require(certificates[_id].id == 0, "Certificate ID already exists.");
        
        certificates[_id] = Certificate({
            id: _id,
            studentName: _studentName,
            course: _course,
            issueDate: _issueDate,
            isValid: true
        });

        certificateIds.push(_id);

        emit CertificateRegistered(_id, _studentName, _course, _issueDate);
    }

    function getCertificate(uint _id) public view returns (uint, string memory, string memory, string memory, bool) {
        Certificate memory cert = certificates[_id];
        require(cert.id != 0, "Certificate does not exist.");
        
        return (cert.id, cert.studentName, cert.course, cert.issueDate, cert.isValid);
    }
    
    function revokeCertificate(uint _id) public {
        Certificate storage cert = certificates[_id];
        require(cert.id != 0, "Certificate does not exist.");
        require(cert.isValid, "Certificate already revoked.");

        cert.isValid = false;
        emit CertificateRevoked(_id);
    }

function getAllCertificateIds() public view returns (uint[] memory) {
    return certificateIds;
}
}

