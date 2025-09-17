// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

require("dotenv").config();
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


const NECTR_TOKEN_ADDRESS = process.env.NECTR_TOKEN_ADDRESS;

module.exports = buildModule("NectrStakingModule", (m) => {

    const NectrStaking = m.contract("NectrStaking", [NECTR_TOKEN_ADDRESS]);

    return { NectrStaking };
});
