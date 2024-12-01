const express = require('express');
const { Web3 } = require('web3');
const { abi, networks } = require('./build/contracts/CertificateRegistry.json');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());

const provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
const web3 = new Web3(provider);

const networkId = "5777";
const contratoAddress = networks[networkId]?.address;

if (!contratoAddress) {
    throw new Error(`Contrato não implantado na rede especificada (networkId: ${networkId}).`);
}

const contrato = new web3.eth.Contract(abi, contratoAddress);

const stringifyBigInt = (obj) =>
    JSON.parse(
        JSON.stringify(obj, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        )
    );

const getAccounts = async () => {
    try {
        return await web3.eth.getAccounts();
    } catch (error) {
        throw new Error('Erro ao obter contas do Web3.');
    }
};

app.post('/certificate', async (req, res, next) => {
    const { action, id, studentName, course, issueDate } = req.body;

    try {
        const accounts = await getAccounts();

        switch (action) {
            case 'register':
                await contrato.methods.registerCertificate(id, studentName, course, issueDate)
                    .send({ from: accounts[0], gas: 500000 });
                return res.json({ message: 'Certificado registrado com sucesso!' });

            case 'get':
                const certificate = await contrato.methods.getCertificate(id).call();
                return res.json(
                    stringifyBigInt({
                        id: certificate[0],
                        studentName: certificate[1],
                        course: certificate[2],
                        issueDate: certificate[3],
                        isValid: certificate[4],
                    })
                );

            case 'revoke':
                await contrato.methods.revokeCertificate(id)
                    .send({ from: accounts[0], gas: 500000 });
                return res.json({ message: 'Certificado revogado com sucesso!' });

            default:
                return res.status(400).json({ error: 'Ação inválida.' });
        }
    } catch (error) {
        next(error); 
    }
});

app.get('/certificates', async (req, res, next) => {
    try {
        const ids = await contrato.methods.getAllCertificateIds().call();
        const certificates = await Promise.all(
            ids.map(async (id) => {
                const certificate = await contrato.methods.getCertificate(id).call();
                return {
                    id: certificate[0].toString(),
                    isValid: certificate[4],
                };
            })
        );
        res.json(certificates);
    } catch (error) {
        next(error); 
    }
});

app.use((err, req, res, next) => {
    console.error('Erro:', err.message);
    res.status(500).json({ error: err.message });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});