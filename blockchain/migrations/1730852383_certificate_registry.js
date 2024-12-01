const CertificateRegistry = artifacts.require('../contracts/CertificateRegistry.sol');

module.exports = async function (_deployer) {
  await _deployer.deploy(CertificateRegistry);
  await CertificateRegistry.deployed();
};
